// Helper para campos i18n no formato { pt, en | null } guardados no DB.

export type I18nText = { pt: string; en: string | null } | string | null | undefined;

export function tx(value: I18nText, fallback = "—"): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "pt" in value && typeof value.pt === "string") {
    return value.pt;
  }
  return fallback;
}
