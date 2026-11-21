import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { contactLeads, contactRateLimits } from "@/db/schema";
import {
  CONTACT_PRIVACY_VERSION,
  ContactRequestError,
  readContactJson,
  validateContact,
} from "@/lib/contact-validation";

export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 15 * 60 * 1_000;
const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function reply(body: object, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...responseHeaders, ...headers } });
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  // Browser submissions must originate on this site. No permissive CORS is added.
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return reply({ ok: false, error: "Abre el formulario desde esta web para enviar tu consulta." }, 403);
  }

  try {
    const now = Date.now();
    const checked = validateContact(await readContactJson(request), now);
    if (!checked.ok) return reply({ ok: false, error: checked.error }, 400);
    const lead = checked.value;
    const fingerprint = await digest(JSON.stringify(lead));
    const reference = `IA-${lead.submissionId.replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    const db = getDb();

    const [existing] = await db
      .select({ fingerprint: contactLeads.fingerprint })
      .from(contactLeads)
      .where(eq(contactLeads.submissionId, lead.submissionId))
      .limit(1);
    if (existing) {
      return existing.fingerprint === fingerprint
        ? reply({ ok: true, reference }, 200)
        : reply({ ok: false, error: "Esta solicitud ya se guardó con otros datos. Actualiza el formulario para enviar una nueva." }, 409);
    }

    const windowStart = Math.floor(now / RATE_WINDOW_MS) * RATE_WINDOW_MS;
    const expiresAt = windowStart + RATE_WINDOW_MS;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const keys = [
      { key: `ip:${await digest(`${windowStart}:${ip}`)}`, limit: 6 },
      { key: `email:${await digest(`${windowStart}:${lead.email}`)}`, limit: 3 },
    ];

    // Expired buckets carry no purpose and are removed on subsequent requests.
    await db.delete(contactRateLimits).where(lt(contactRateLimits.expiresAt, now));
    for (const bucket of keys) {
      // The conditional upsert is atomic, so concurrent requests cannot exceed the cap.
      const reserved = await db
        .insert(contactRateLimits)
        .values({ key: bucket.key, count: 1, expiresAt })
        .onConflictDoUpdate({
          target: contactRateLimits.key,
          set: { count: sql`${contactRateLimits.count} + 1` },
          setWhere: sql`${contactRateLimits.count} < ${bucket.limit}`,
        })
        .returning({ key: contactRateLimits.key });
      if (reserved.length === 0) {
        return reply(
          { ok: false, error: "Has enviado varias solicitudes. Espera unos minutos antes de intentarlo de nuevo." },
          429,
          { "Retry-After": String(Math.max(1, Math.ceil((expiresAt - now) / 1_000))) },
        );
      }
    }

    const saved = await db
      .insert(contactLeads)
      .values({ ...lead, fingerprint, createdAt: now, privacyNoticeVersion: CONTACT_PRIVACY_VERSION })
      .onConflictDoNothing({ target: contactLeads.submissionId })
      .returning({ submissionId: contactLeads.submissionId });

    // A second simultaneous submission can win the insert; verify its fingerprint.
    if (saved.length === 0) {
      const [raced] = await db
        .select({ fingerprint: contactLeads.fingerprint })
        .from(contactLeads)
        .where(eq(contactLeads.submissionId, lead.submissionId))
        .limit(1);
      if (raced?.fingerprint !== fingerprint) {
        return reply({ ok: false, error: "Esta solicitud ya se guardó con otros datos. Actualiza el formulario para enviar una nueva." }, 409);
      }
    }
    return reply({ ok: true, reference }, saved.length ? 201 : 200);
  } catch (error) {
    if (error instanceof ContactRequestError) {
      return reply({ ok: false, error: error.message }, error.status);
    }
    // Do not log names, email addresses, messages, IPs, or database exceptions.
    return reply(
      { ok: false, error: "No hemos podido confirmar el envío. Inténtalo de nuevo; no se duplicará tu solicitud." },
      503,
    );
  }
}
