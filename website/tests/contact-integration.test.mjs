import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Miniflare } from "miniflare";

// Exercise the real route, Drizzle queries and generated migration against local
// D1/SQLite. This Worker exists only in memory during this test run.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://contact-integration.example.test";
const windowMs = 15 * 60 * 1_000;
const clock = Math.floor(Date.now() / windowMs) * windowMs + 60_000;
const statePath = path.join(root, ".sites-runtime", `contact-test-${randomUUID()}`);
let runtime;
let database;

before(async () => {
  const compiled = await build({
    absWorkingDir: root,
    stdin: {
      contents: `
        import { POST } from './app/api/contact/route.ts';
        const realNow = Date.now;
        export default {
          async fetch(request) {
            if (request.method !== 'POST') return new Response(null, {status: 405});
            const simulatedTime = Number(request.headers.get('x-test-clock'));
            Date.now = () => simulatedTime;
            try { return await POST(request); }
            finally { Date.now = realNow; }
          }
        };
      `,
      resolveDir: root,
      sourcefile: "contact-integration-worker.ts",
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    target: "es2022",
    external: ["cloudflare:workers"],
    tsconfig: path.join(root, "tsconfig.json"),
  });
  runtime = new Miniflare({
    modules: true,
    script: compiled.outputFiles[0].text,
    compatibilityDate: "2026-05-15",
    compatibilityFlags: ["nodejs_compat"],
    cf: false,
    d1Databases: { DB: "contact-integration" },
    d1Persist: statePath,
  });
  database = await runtime.getD1Database("DB");
  const migrations = (await readdir(path.join(root, "drizzle")))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  assert.ok(migrations.length, "Generate the D1 schema migration before running this test.");
  for (const name of migrations) {
    const source = await readFile(path.join(root, "drizzle", name), "utf8");
    for (const statement of source.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean)) {
      await database.prepare(statement).run();
    }
  }
});

after(async () => {
  await runtime?.dispose();
  await rm(statePath, { recursive: true, force: true });
});

beforeEach(async () => {
  await database.batch([
    database.prepare("DELETE FROM contact_leads"),
    database.prepare("DELETE FROM contact_rate_limits"),
  ]);
});

function payload(overrides = {}, now = clock) {
  return {
    name: "Persona de prueba",
    email: "prueba@example.test",
    company: "Ejemplo de prueba",
    service: "automatizacion",
    message: "Me gustaría automatizar la preparación del informe mensual.",
    privacyConsent: true,
    website: "",
    startedAt: now - 5_000,
    submissionId: randomUUID(),
    ...overrides,
  };
}

async function submit(body, { now = clock, requestOrigin = origin, ip = "192.0.2.10" } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "x-test-clock": String(now),
    "cf-connecting-ip": ip,
  };
  if (requestOrigin !== null) headers.Origin = requestOrigin;
  const response = await runtime.dispatchFetch(`${origin}/api/contact`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return { status: response.status, headers: response.headers, data: await response.json() };
}

const countLeads = async () =>
  (await database.prepare("SELECT count(*) AS count FROM contact_leads").first()).count;

test("a successful response corresponds to a durable, consented lead", async () => {
  const input = payload();
  const result = await submit(input);
  assert.equal(result.status, 201);
  assert.equal(result.data.ok, true);
  assert.match(result.data.reference, /^IA-[A-F0-9]{12}$/u);
  assert.equal(result.headers.get("cache-control"), "no-store");
  const row = await database.prepare("SELECT * FROM contact_leads WHERE submission_id = ?").bind(input.submissionId).first();
  assert.equal(row.email, input.email);
  assert.equal(row.message, input.message);
  assert.equal(row.privacy_consent, 1);
  assert.equal(row.privacy_notice_version, "2026-11-21");
  assert.equal(row.status, "new");
  assert.equal(row.created_at, clock);
});

test("simultaneous identical submissions insert once and share their reference", async () => {
  const input = payload();
  const results = await Promise.all([submit(input), submit(input)]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 201]);
  assert.equal(results[0].data.reference, results[1].data.reference);
  assert.equal(await countLeads(), 1);
  const retry = await submit(input);
  assert.equal(retry.status, 200);
  assert.equal(retry.data.reference, results[0].data.reference);
  assert.equal(await countLeads(), 1);
});

test("reusing an id with changed content cannot overwrite a stored lead", async () => {
  const input = payload();
  assert.equal((await submit(input)).status, 201);
  const changed = await submit({ ...input, message: "Un mensaje diferente intenta sobrescribir los datos originales." });
  assert.equal(changed.status, 409);
  const row = await database.prepare("SELECT message FROM contact_leads WHERE submission_id = ?").bind(input.submissionId).first();
  assert.equal(row.message, input.message);
  assert.equal(await countLeads(), 1);
});

test("concurrent requests cannot exceed three leads for one email per window", async () => {
  const results = await Promise.all(Array.from({ length: 18 }, () => submit(payload())));
  assert.equal(results.filter((r) => r.status === 201).length, 3);
  assert.equal(results.filter((r) => r.status === 429).length, 15);
  assert.equal(await countLeads(), 3);
  const buckets = await database.prepare("SELECT key, count FROM contact_rate_limits").all();
  assert.equal(buckets.results.find((row) => row.key.startsWith("email:")).count, 3);
  assert.ok(results.find((r) => r.status === 429).headers.get("retry-after"));
});

test("concurrent requests cannot exceed six leads for one IP across many emails", async () => {
  const results = await Promise.all(Array.from({ length: 18 }, (_, i) =>
    submit(payload({ email: `persona-${i}@example.test` })),
  ));
  assert.equal(results.filter((r) => r.status === 201).length, 6);
  assert.equal(results.filter((r) => r.status === 429).length, 12);
  assert.equal(await countLeads(), 6);
  const bucket = await database.prepare("SELECT key, count FROM contact_rate_limits WHERE key LIKE 'ip:%'").first();
  assert.equal(bucket.count, 6);
  assert.match(bucket.key, /^ip:[0-9a-f]{64}$/u);
  assert.ok(!bucket.key.includes("192.0.2.10"));
});

test("a new rate window allows new leads and removes expired buckets", async () => {
  for (let i = 0; i < 3; i++) assert.equal((await submit(payload())).status, 201);
  assert.equal((await submit(payload())).status, 429);
  const nextWindow = clock + windowMs;
  const next = await submit(payload({}, nextWindow), { now: nextWindow });
  assert.equal(next.status, 201);
  assert.equal(await countLeads(), 4);
  const buckets = await database.prepare("SELECT expires_at FROM contact_rate_limits").all();
  assert.equal(buckets.results.length, 2);
  assert.ok(buckets.results.every((row) => row.expires_at > nextWindow));
});

test("invalid origin, absent origin and absent consent never write leads or rate buckets", async () => {
  assert.equal((await submit(payload(), { requestOrigin: "https://other.example.test" })).status, 403);
  assert.equal((await submit(payload(), { requestOrigin: null })).status, 403);
  assert.equal((await submit(payload({ privacyConsent: false }))).status, 400);
  assert.equal(await countLeads(), 0);
  const row = await database.prepare("SELECT count(*) AS count FROM contact_rate_limits").first();
  assert.equal(row.count, 0);
});
