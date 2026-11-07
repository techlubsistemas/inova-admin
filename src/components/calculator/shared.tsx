"use client";

import { api, ApiError } from "@/lib/api";
import { SAVED_NOTICE } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/structured/ui";

export type Obj = Record<string, unknown>;

export type CalcConfig = {
  id: string;
  multipliers: Obj;
  defaults: Obj;
  genericDefaults: Obj;
  contaminationMultipliers: Obj;
  copy: Obj;
  updatedAt: string;
};

export type CalcPatch = Partial<
  Pick<CalcConfig, "multipliers" | "defaults" | "genericDefaults" | "contaminationMultipliers" | "copy">
>;

export async function saveCalcConfig(patch: CalcPatch): Promise<CalcConfig> {
  const data = await api.put<{ config: CalcConfig }>("/cms/admin/calculator/config", patch);
  return data.config;
}

export function asObj(v: unknown): Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : {};
}

/** Níveis de contaminação como o site os usa. */
export const CONTAMINACAO = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export type NumRule = { min?: number; max?: number; integer?: boolean; positive?: boolean };

/** Converte o texto digitado. Vazio = sem valor (o site usa o do código). Aceita vírgula. */
export function parseNum(
  text: string,
  rule: NumRule,
): { ok: true; value: number | undefined } | { ok: false; error: string } {
  const t = text.trim().replace(",", ".");
  if (t === "") return { ok: true, value: undefined };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false, error: "não é um número" };
  if (rule.integer && !Number.isInteger(n)) return { ok: false, error: "use um número inteiro" };
  if (rule.positive && n <= 0) return { ok: false, error: "precisa ser maior que zero" };
  if (rule.min !== undefined && n < rule.min) return { ok: false, error: `mínimo ${rule.min}` };
  if (rule.max !== undefined && n > rule.max) return { ok: false, error: `máximo ${rule.max}` };
  return { ok: true, value: n };
}

export const numStr = (v: unknown) => (typeof v === "number" ? String(v) : "");

export function NumField({
  value,
  onChange,
  error,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  label: string;
  className?: string;
}) {
  return (
    <div>
      <input
        inputMode="decimal"
        aria-label={label}
        value={value}
        placeholder="vazio"
        onChange={(e) => onChange(e.target.value)}
        className={
          className ??
          `w-28 rounded border bg-background px-2 py-1 text-right text-sm ${
            error ? "border-destructive" : "border-input"
          }`
        }
      />
      {error && <div className="mt-0.5 max-w-[9rem] text-[10px] text-destructive">{error}</div>}
    </div>
  );
}

export function SectionActions({
  saving,
  err,
  ok,
  onSave,
  onRevert,
  dirty,
}: {
  saving: boolean;
  err: string | null;
  ok: boolean;
  onSave: () => void;
  onRevert: () => void;
  dirty: boolean;
}) {
  return (
    <div className="mt-3 space-y-2">
      {err && <Notice tone="error">{err}</Notice>}
      {ok && !dirty && <Notice tone="success">{SAVED_NOTICE}</Notice>}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={saving || !dirty}>
          {saving ? "Salvando…" : "Salvar"}
        </Button>
        <Button size="sm" variant="outline" onClick={onRevert} disabled={!dirty || saving}>
          Desfazer alterações
        </Button>
      </div>
    </div>
  );
}

export function errMsg(e: unknown) {
  return e instanceof ApiError ? `Não foi possível salvar: ${e.message}` : "Não foi possível salvar.";
}
