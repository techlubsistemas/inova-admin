// Helpers para campos i18n no formato { pt, en | null } guardados no DB.
// Regra do painel: editar só o `pt` e PRESERVAR o `en` (e qualquer outra chave).

export type I18nText = { pt: string; en: string | null } | string | null | undefined;

export function tx(value: I18nText, fallback = "—"): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "pt" in value && typeof value.pt === "string") {
    return value.pt;
  }
  return fallback;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Texto em português de um valor i18n (string pura ou { pt }). Vazio se não houver. */
export function ptText(value: unknown): string {
  if (typeof value === "string") return value;
  if (isObj(value) && typeof value.pt === "string") return value.pt;
  return "";
}

/** `true` se há tradução em inglês guardada. */
export function hasEn(value: unknown): boolean {
  return isObj(value) && typeof value.en === "string" && value.en.trim() !== "";
}

/**
 * Atualiza o texto em português mantendo o formato que já existia:
 * string continua string; objeto continua objeto (com `en` e outras chaves).
 * Se não havia nada, cria { pt, en: null }.
 */
export function setPtKeepShape(existing: unknown, text: string): unknown {
  if (typeof existing === "string") return text;
  if (isObj(existing)) return { ...existing, pt: text };
  return { pt: text, en: null };
}

/**
 * Monta o objeto i18n para a API: `pt` novo + `en` ORIGINAL (nunca apaga tradução).
 */
export function i18nPayload(
  existing: unknown,
  text: string,
): { pt: string; en: string | null } {
  const en = isObj(existing) && typeof existing.en === "string" ? existing.en : null;
  return { pt: text, en };
}

/**
 * Para campos opcionais: texto preenchido -> objeto i18n (com `en` original).
 * Vazio -> `null` (limpa) se já havia valor, ou `undefined` (não envia) se não havia.
 */
export function i18nOptionalPayload(
  existing: unknown,
  text: string,
): { pt: string; en: string | null } | null | undefined {
  const t = text.trim();
  if (t) return i18nPayload(existing, t);
  return existing == null ? undefined : null;
}

/** Versão em lista de parágrafos ({ pt: string[], en: string[] | null }), preservando `en`. */
export function i18nListPayload(
  existing: unknown,
  paragraphs: string[],
): { pt: string[]; en: string[] | null } {
  const en =
    isObj(existing) && Array.isArray(existing.en) ? (existing.en as string[]) : null;
  return { pt: paragraphs, en };
}

export const SAVED_NOTICE =
  "Salvo. Em produção, a mudança aparece no site em até 60 segundos.";
