import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Contact records are written server-side and never exposed by a public API. */
export const contactLeads = sqliteTable(
  "contact_leads",
  {
    submissionId: text("submission_id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    service: text("service", {
      enum: ["automatizacion", "formacion", "consultoria", "explorar"],
    }).notNull(),
    message: text("message").notNull(),
    privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull(),
    privacyNoticeVersion: text("privacy_notice_version").notNull(),
    fingerprint: text("fingerprint").notNull(),
    createdAt: integer("created_at").notNull(),
    status: text("status", { enum: ["new", "contacted", "closed"] })
      .notNull()
      .default("new"),
  },
  (table) => [index("contact_leads_created_at_idx").on(table.createdAt)],
);

/** Fifteen-minute, hashed abuse-control buckets; no raw IP addresses are stored. */
export const contactRateLimits = sqliteTable(
  "contact_rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => [index("contact_rate_limits_expiry_idx").on(table.expiresAt)],
);
