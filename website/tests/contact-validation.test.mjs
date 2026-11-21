import test from "node:test";
import assert from "node:assert/strict";
import { readContactJson, validateContact } from "../lib/contact-validation.ts";

const now = 1_800_000_000_000;
const valid = {
  name: "  Persona de prueba  ",
  email: "PRUEBA@example.test",
  company: "  ",
  service: "automatizacion",
  message: "Quiero automatizar el informe mensual de mi equipo.",
  privacyConsent: true,
  website: "",
  startedAt: now - 5_000,
  submissionId: "e967fddb-f7c2-4fe7-b23b-c3618da26d1f",
};

test("valid input is normalized without modifying the visitor's message", () => {
  const result = validateContact(valid, now);
  assert.equal(result.ok, true);
  assert.equal(result.value.name, "Persona de prueba");
  assert.equal(result.value.email, "prueba@example.test");
  assert.equal(result.value.company, null);
  assert.equal(result.value.message, valid.message);
});

test("consent, honeypot, email, service and timing protections reject invalid submissions", () => {
  for (const change of [
    { privacyConsent: false },
    { privacyConsent: "true" },
    { website: "https://example.test" },
    { email: "not-an-email" },
    { email: "a@b..test" },
    { service: "unknown" },
    { startedAt: now - 1_000 },
    { startedAt: now + 5_000 },
    { startedAt: now - 90_000_000 },
    { name: "Line\nbreak" },
    { message: "Too short" },
    { submissionId: "guessable-id" },
  ]) assert.equal(validateContact({ ...valid, ...change }, now).ok, false, JSON.stringify(change));
});

test("a multiline message remains valid", () => {
  assert.equal(validateContact({ ...valid, message: "Primera línea del mensaje.\n\nSegunda línea con el contexto del proyecto." }, now).ok, true);
});

test("JSON reading rejects malformed input and unsupported content types", async () => {
  await assert.rejects(readContactJson(new Request("https://example.test", { method: "POST", body: "broken", headers: { "Content-Type": "application/json" } })), { status: 400 });
  await assert.rejects(readContactJson(new Request("https://example.test", { method: "POST", body: JSON.stringify(valid), headers: { "Content-Type": "text/plain" } })), { status: 415 });
});

test("streaming byte limit holds even without a Content-Length header", async () => {
  const body = JSON.stringify({ message: "€".repeat(4_000) });
  assert.ok(body.length < 10_240);
  const request = new Request("https://example.test", { method: "POST", headers: { "Content-Type": "application/json" }, body });
  assert.equal(request.headers.get("content-length"), null);
  await assert.rejects(readContactJson(request), { status: 413 });
});
