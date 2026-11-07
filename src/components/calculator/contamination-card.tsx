"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import {
  CONTAMINACAO,
  NumField,
  SectionActions,
  errMsg,
  numStr,
  parseNum,
  saveCalcConfig,
  type CalcConfig,
  type Obj,
} from "./shared";

/** Multiplicadores por nível de contaminação (baixa, média, alta, crítica). */
export function ContaminationCard({
  original,
  onSaved,
}: {
  original: Obj;
  onSaved: (c: CalcConfig) => void;
}) {
  const init = () =>
    Object.fromEntries(CONTAMINACAO.map((c) => [c.value, numStr(original[c.value])]));
  const [cells, setCells] = useState<Record<string, string>>(init);
  const [saved, setSaved] = useState<Record<string, string>>(init);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const dirty = JSON.stringify(cells) !== JSON.stringify(saved);
  useUnsavedWarning(dirty);

  async function save() {
    setErr(null);
    setOk(false);
    const errs: Record<string, string> = {};
    const next: Obj = { ...original };
    for (const c of CONTAMINACAO) {
      const res = parseNum(cells[c.value], { positive: true, max: 100 });
      if (!res.ok) {
        errs[c.value] = res.error;
        continue;
      }
      if (res.value === undefined) delete next[c.value];
      else next[c.value] = res.value;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setErr("Corrija os campos em vermelho antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      const updated = await saveCalcConfig({ contaminationMultipliers: next });
      setSaved(cells);
      setOk(true);
      onSaved(updated);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peso de cada nível de contaminação</CardTitle>
        <CardDescription className="text-xs">
          Quando a pessoa informa o nível de contaminação do equipamento, a perda estimada é
          multiplicada por este número. 1 não muda nada; abaixo de 1 reduz; acima de 1 aumenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CONTAMINACAO.map((c) => (
            <div key={c.value} className="rounded border bg-muted/20 px-3 py-2">
              <div className="text-xs font-medium uppercase text-muted-foreground">{c.label}</div>
              <NumField
                label={`Peso do nível ${c.label}`}
                value={cells[c.value]}
                error={errors[c.value]}
                onChange={(v) => {
                  setOk(false);
                  setCells((p) => ({ ...p, [c.value]: v }));
                }}
                className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-right text-lg"
              />
            </div>
          ))}
        </div>
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
