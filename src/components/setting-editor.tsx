"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { SAVED_NOTICE } from "@/lib/i18n";
import { openPreview } from "@/lib/site";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StructuredEditor } from "@/components/structured/structured-editor";
import { AdvancedJson } from "@/components/structured/advanced-json";
import { Notice } from "@/components/structured/ui";
import type { Schema } from "@/components/structured/types";

export type Setting = {
  key: string;
  value: unknown;
  updatedAt?: string;
};

type Obj = Record<string, unknown>;

function asObj(v: unknown): Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : {};
}

/**
 * Editor de uma "setting" do site: campos guiados por esquema, modo avançado
 * (JSON) recolhido, salvar, desfazer e (opcional) pré-visualizar no site.
 * Se a setting ainda não existe (`item = null`), começa vazia e o PUT cria.
 */
export function SettingEditor({
  settingKey,
  meta,
  schema,
  item,
  previewable,
  defaultOpen = true,
  renderExtra,
  validate,
  onSaved,
}: {
  settingKey: string;
  meta: { label: string; description: string };
  schema: Schema;
  item: Setting | null;
  previewable?: boolean;
  defaultOpen?: boolean;
  /** Conteúdo extra (ex.: editor de blocos) abaixo dos campos do esquema. */
  renderExtra?: (value: Obj, setValue: (next: Obj) => void) => React.ReactNode;
  validate?: (value: Obj) => string | null;
  onSaved?: (updated: Setting) => void;
}) {
  const initial = asObj(item?.value);
  const [value, setValue] = useState<Obj>(initial);
  const [savedJson, setSavedJson] = useState(JSON.stringify(initial));
  const [exists, setExists] = useState(item !== null);
  const [open, setOpen] = useState(defaultOpen);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const dirty = JSON.stringify(value) !== savedJson;
  useUnsavedWarning(dirty);

  // Texto recarregado de fora (ex.: "partir do texto atual") passa por `change`.
  useEffect(() => {
    if (dirty) setOk(false);
  }, [dirty]);

  function change(next: Obj) {
    setValue(next);
  }

  async function save() {
    setErr(null);
    setOk(false);
    const problem = validate?.(value);
    if (problem) {
      setErr(problem);
      return;
    }
    setSaving(true);
    try {
      const data = await api.put<{ item: Setting }>(`/cms/admin/settings/${settingKey}`, {
        value,
      });
      const saved = asObj(data.item.value);
      setValue(saved);
      setSavedJson(JSON.stringify(saved));
      setExists(true);
      onSaved?.(data.item);
      setOk(true);
    } catch (e) {
      // Nada se perde: o que foi digitado continua na tela.
      setErr(
        e instanceof ApiError
          ? `Não foi possível salvar: ${e.message}`
          : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function preview() {
    setErr(null);
    setPreviewing(true);
    try {
      await openPreview(settingKey, value);
    } catch (e) {
      setErr(
        e instanceof ApiError
          ? `Não foi possível gerar a prévia: ${e.message}`
          : "Não foi possível gerar a prévia.",
      );
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            {open ? (
              <ChevronDown className="mt-1 h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-base">{meta.label}</CardTitle>
              <CardDescription className="text-xs">{meta.description}</CardDescription>
            </div>
          </div>
          {dirty && (
            <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-900">
              Alterações não salvas
            </span>
          )}
        </div>
      </CardHeader>
      {/* Fica montado (só escondido) para não perder o que foi digitado. */}
      <CardContent className={open ? "space-y-4" : "hidden"}>
        {!exists && (
          <Notice tone="info">
            Este conteúdo ainda não foi salvo no banco. Enquanto isso, o site usa o texto
            padrão. Ao salvar, o que você preencher passa a valer; campos vazios continuam
            com o texto padrão.
          </Notice>
        )}
        <StructuredEditor schema={schema} value={value} onChange={change} />
        {renderExtra?.(value, change)}
        <AdvancedJson value={value} onApply={change} />

        {err && <Notice tone="error">{err}</Notice>}
        {ok && !dirty && <Notice tone="success">{SAVED_NOTICE}</Notice>}
        {previewable && (
          <p className="text-[11px] text-muted-foreground">
            A pré-visualização mostra o que está na tela agora, mesmo sem salvar, e vale por 1
            hora. Ela só cobre a home, o rodapé e o menu do topo.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={save} disabled={saving || (!dirty && exists)}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!dirty || saving}
            onClick={() => {
              setValue(JSON.parse(savedJson) as Obj);
              setErr(null);
            }}
          >
            Desfazer alterações
          </Button>
          {previewable && (
            <Button
              size="sm"
              variant="outline"
              onClick={preview}
              disabled={previewing || saving}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              {previewing ? "Gerando…" : "Pré-visualizar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
