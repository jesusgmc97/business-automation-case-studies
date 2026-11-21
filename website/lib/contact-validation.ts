export const CONTACT_BODY_LIMIT = 10_240;
export const CONTACT_MIN_FILL_MS = 2_000;
export const CONTACT_MAX_FILL_MS = 86_400_000;
export const CONTACT_PRIVACY_VERSION = "2026-11-21";

const services = ["automatizacion", "formacion", "consultoria", "explorar"] as const;
export type ContactService = (typeof services)[number];

export interface ValidatedContact {
  submissionId: string;
  name: string;
  email: string;
  company: string | null;
  service: ContactService;
  message: string;
  privacyConsent: true;
}

type ValidationResult =
  | { ok: true; value: ValidatedContact }
  | { ok: false; error: string };

const singleLine = (value: unknown, minimum: number, maximum: number) =>
  typeof value === "string" &&
  value.trim().length >= minimum &&
  value.trim().length <= maximum &&
  !/[\u0000-\u001f\u007f]/u.test(value);

export function validateContact(input: unknown, now = Date.now()): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Revisa los datos del formulario e inténtalo de nuevo." };
  }
  const data = input as Record<string, unknown>;
  if (data.website !== "") {
    return { ok: false, error: "No se ha podido validar el formulario. Actualiza la página." };
  }
  if (!singleLine(data.name, 2, 100)) {
    return { ok: false, error: "Escribe un nombre de entre 2 y 100 caracteres." };
  }
  if (
    !singleLine(data.email, 3, 254) ||
    !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test((data.email as string).trim())
  ) {
    return { ok: false, error: "Escribe un correo electrónico válido para poder responderte." };
  }
  if (data.company !== undefined && !singleLine(data.company, 0, 160)) {
    return { ok: false, error: "El nombre de la empresa debe tener como máximo 160 caracteres." };
  }
  if (typeof data.service !== "string" || !services.includes(data.service as ContactService)) {
    return { ok: false, error: "Selecciona el servicio que te interesa." };
  }
  if (
    typeof data.message !== "string" ||
    data.message.trim().length < 20 ||
    data.message.trim().length > 3_000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(data.message)
  ) {
    return { ok: false, error: "Cuéntame tu idea con entre 20 y 3.000 caracteres." };
  }
  if (data.privacyConsent !== true) {
    return { ok: false, error: "Acepta el tratamiento de tus datos para responder a tu consulta." };
  }
  if (
    typeof data.startedAt !== "number" ||
    !Number.isSafeInteger(data.startedAt) ||
    now - data.startedAt < CONTACT_MIN_FILL_MS ||
    now - data.startedAt > CONTACT_MAX_FILL_MS
  ) {
    return { ok: false, error: "Espera un momento y vuelve a enviar. Si persiste, actualiza la página." };
  }
  if (
    typeof data.submissionId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(data.submissionId)
  ) {
    return { ok: false, error: "La sesión del formulario no es válida. Actualiza la página." };
  }
  return {
    ok: true,
    value: {
      submissionId: data.submissionId.toLowerCase(),
      name: (data.name as string).trim(),
      email: (data.email as string).trim().toLowerCase(),
      company: typeof data.company === "string" ? data.company.trim() || null : null,
      service: data.service as ContactService,
      message: data.message.trim(),
      privacyConsent: true,
    },
  };
}

export class ContactRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ContactRequestError";
    this.status = status;
  }
}

/** Limit bytes while streaming, including requests without Content-Length. */
export async function readContactJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ContactRequestError("El formato del formulario no es válido.", 415);
  }
  const announcedSize = Number(request.headers.get("content-length") || "0");
  if (announcedSize > CONTACT_BODY_LIMIT) {
    throw new ContactRequestError("El mensaje es demasiado largo. Reduce su tamaño e inténtalo de nuevo.", 413);
  }
  if (!request.body) throw new ContactRequestError("El formulario está vacío.", 400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let body = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > CONTACT_BODY_LIMIT) {
        await reader.cancel();
        throw new ContactRequestError("El mensaje es demasiado largo. Reduce su tamaño e inténtalo de nuevo.", 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof ContactRequestError) throw error;
    throw new ContactRequestError("No se han podido leer los datos del formulario.", 400);
  } finally {
    reader.releaseLock();
  }
}
