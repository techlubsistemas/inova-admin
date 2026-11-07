"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { selectCls } from "@/components/option-select";
import {
  NumField,
  SectionActions,
  asObj,
  errMsg,
  numStr,
  parseNum,
  type NumRule,
  type Obj,
} from "./shared";

export type GridRow = { id: string; label: string; source: Obj };

export type GridCol =
  | { key: string; label: string; help?: string; kind: "number"; rule: NumRule }
  | { key: string; label: string; help?: string; kind: "select"; options: { value: string; label: string }[] };

type Cells = Record<string, Record<string, string>>;

function toCells(rows: GridRow[], cols: GridCol[]): Cells {
  const out: Cells = {};
  for (const r of rows) {
    out[r.id] = {};
    for (const c of cols) {
      const v = r.source[c.key];
      out[r.id][c.key] = c.kind === "number" ? numStr(v) : typeof v === "string" ? v : "";
    }
  }
  return out;
}

/**
 * Tabela de números editáveis (uma linha por setor, uma coluna por campo).
 * Valida os números antes de salvar. Campo vazio = o site usa o valor do código.
 * Chaves e campos que não aparecem na tabela são preservados ao salvar.
 */
export function GridCard({
  title,
  description,
  rows,
  cols,
  firstColLabel = "Setor",
  onSave,
}: {
  title: string;
  description: React.ReactNode;
  rows: GridRow[];
  cols: GridCol[];
  firstColLabel?: string;
  /** Recebe as linhas já mescladas com o original (id -> objeto) e grava. */
  onSave: (merged: Record<string, Obj>) => Promise<void>;
}) {
  const [cells, setCells] = useState<Cells>(() => toCells(rows, cols));
  const [saved, setSaved] = useState<Cells>(() => toCells(rows, cols));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const dirty = JSON.stringify(cells) !== JSON.stringify(saved);
  useUnsavedWarning(dirty);

  function set(rowId: string, key: string, v: string) {
    setOk(false);
    setCells((p) => ({ ...p, [rowId]: { ...p[rowId], [key]: v } }));
  }

  async function save() {
    setErr(null);
    setOk(false);
    const errs: Record<string, string> = {};
    const merged: Record<string, Obj> = {};
    for (const r of rows) {
      const row: Obj = { ...asObj(r.source) };
      for (const c of cols) {
        const text = cells[r.id][c.key];
        if (c.kind === "number") {
          const res = parseNum(text, c.rule);
          if (!res.ok) {
            errs[`${r.id}.${c.key}`] = res.error;
            continue;
          }
          if (res.value === undefined) delete row[c.key];
          else row[c.key] = res.value;
        } else if (text === "") {
          delete row[c.key];
        } else {
          row[c.key] = text;
        }
      }
      // Linha que não existia e continua vazia: não cria um objeto vazio no banco.
      if (Object.keys(row).length === 0 && Object.keys(r.source).length === 0) continue;
      merged[r.id] = row;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setErr("Corrija os campos em vermelho antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await onSave(merged);
      setSaved(cells);
      setOk(true);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-3 py-2">{firstColLabel}</th>
                {cols.map((c) => (
                  <th key={c.key} className="px-3 py-2">
                    {c.label}
                    {c.help && <div className="font-normal">{c.help}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="px-3 py-2">{r.label}</td>
                  {cols.map((c) => (
                    <td key={c.key} className="px-3 py-2">
                      {c.kind === "number" ? (
                        <NumField
                          label={`${r.label}: ${c.label}`}
                          value={cells[r.id][c.key]}
                          onChange={(v) => set(r.id, c.key, v)}
                          error={errors[`${r.id}.${c.key}`]}
                        />
                      ) : (
                        <SelectCell
                          label={`${r.label}: ${c.label}`}
                          value={cells[r.id][c.key]}
                          options={c.options}
                          onChange={(v) => set(r.id, c.key, v)}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Deixe em branco para o site usar o valor que já vem no código.
        </p>
        <SectionActions
          saving={saving}
          err={err}
          ok={ok}
          dirty={dirty}
          onSave={save}
          onRevert={() => {
            setCells(saved);
            setErrors({});
            setErr(null);
          }}
        />
      </CardContent>
    </Card>
  );
}

function SelectCell({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label: string;
}) {
  const outside = value !== "" && !options.some((o) => o.value === value);
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${selectCls} h-9 w-32 px-2 py-1`}
    >
      <option value="">(código)</option>
      {outside && <option value={value}>{value} (fora da lista)</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
