"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { StructuredEditor } from "@/components/structured/structured-editor";
import { AdvancedJson } from "@/components/structured/advanced-json";
import type { Schema } from "@/components/structured/types";
import { SectionActions, errMsg, saveCalcConfig, type CalcConfig, type Obj } from "./shared";

const copySchema: Schema = [
  {
    type: "list",
    key: "steps",
    label: "Nomes das etapas",
    help: "Na ordem em que aparecem na calculadora. Troque só o texto; mantenha a quantidade de etapas.",
    itemLabel: "Etapa",
    addLabel: "Adicionar etapa",
    item: { scalar: { type: "i18n", key: "", label: "Nome da etapa" } },
    newItem: () => ({ pt: "", en: null }),
  },
  { type: "i18n", key: "gateTitle", label: "Título da tela de cadastro" },
  { type: "i18n", key: "gateSubtitle", label: "Texto da tela de cadastro", multiline: true },
  { type: "i18n", key: "resultTitle", label: "Título do resultado" },
  { type: "i18n", key: "resultSubtitle", label: "Texto do resultado", multiline: true },
  { type: "i18n", key: "ctaWhatsapp", label: "Texto do botão de WhatsApp" },
];

/** Textos da calculadora (copy) em campos normais; chaves desconhecidas são preservadas. */
export function CopyCard({
  original,
  onSaved,
}: {
  original: Obj;
  onSaved: (c: CalcConfig) => void;
}) {
  const [value, setValue] = useState<Obj>(original);
  const [savedJson, setSavedJson] = useState(JSON.stringify(original));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const dirty = JSON.stringify(value) !== savedJson;
  useUnsavedWarning(dirty);

  async function save() {
    setErr(null);
    setOk(false);
    setSaving(true);
    try {
      const updated = await saveCalcConfig({ copy: value });
      setSavedJson(JSON.stringify(value));
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
        <CardTitle className="text-base">Textos da calculadora</CardTitle>
        <CardDescription className="text-xs">
          Títulos, textos e nomes das etapas mostrados ao visitante. Campos em branco usam o texto
          que já vem no site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StructuredEditor schema={copySchema} value={value} onChange={(v) => { setOk(false); setValue(v); }} />
        <AdvancedJson value={value} onApply={(v) => { setOk(false); setValue(v); }} />
        <SectionActions
          saving={saving}
          err={err}
          ok={ok}
          dirty={dirty}
          onSave={save}
          onRevert={() => {
            setValue(JSON.parse(savedJson) as Obj);
            setErr(null);
          }}
        />
      </CardContent>
    </Card>
  );
}
