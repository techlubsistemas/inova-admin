"use client";

import { PageHeader } from "@/components/page-header";
import { SettingEditor } from "@/components/setting-editor";
import { BlocksEditor, type Block } from "@/components/blocks-editor";
import { Notice } from "@/components/structured/ui";
import { Button } from "@/components/ui/button";
import type { Schema } from "@/components/structured/types";
import { legalPrivacyDefault, legalTermsDefault, type LegalDefault } from "@/lib/legal-defaults";
import { setPtKeepShape } from "@/lib/i18n";
import { SEED_HINT, useSettings } from "@/lib/use-settings";

type Obj = Record<string, unknown>;

const legalSchema: Schema = [
  {
    type: "boolean",
    key: "enabled",
    label: "Usar este texto no site",
    onLabel: "Ligado: o site mostra o texto editado aqui",
    help: "Desligado (padrão), o site continua mostrando o texto que já tem no código, mesmo que haja algo escrito abaixo.",
  },
  { type: "i18n", key: "title", label: "Título da página" },
  {
    type: "text",
    key: "updatedAtLabel",
    label: "Frase da data de atualização",
    placeholder: "Ex.: Última Atualização: 29 de Janeiro de 2026",
  },
];

function sectionsOf(v: Obj): Block[] {
  return Array.isArray(v.sections) ? (v.sections as Block[]) : [];
}

function LegalExtra({
  value,
  setValue,
  base,
}: {
  value: Obj;
  setValue: (n: Obj) => void;
  base: LegalDefault;
}) {
  const sections = sectionsOf(value);
  const enabled = value.enabled === true;

  function fromCurrent() {
    if (
      sections.length > 0 &&
      !window.confirm(
        "Isso substitui o título e os blocos de texto que estão na tela pelo texto atual do site. Continuar?",
      )
    )
      return;
    setValue({
      ...value,
      title: setPtKeepShape(value.title, base.title),
      updatedAtLabel: base.updatedAtLabel,
      sections: base.sections.map((s) => ({ ...s })),
    });
  }

  return (
    <div className="space-y-3">
      {!enabled && (
        <Notice tone="warning">
          Desligado: o site continua mostrando o texto atual, não este. Ligue o interruptor acima
          e salve quando o texto estiver pronto.
        </Notice>
      )}
      {enabled && sections.length === 0 && (
        <Notice tone="warning">
          Ligado, mas sem nenhum bloco de texto: o site continua com o texto atual até você
          adicionar conteúdo.
        </Notice>
      )}
      {"body" in value && sections.length === 0 && (
        <Notice tone="info">
          Existe um texto antigo (formato anterior) guardado aqui, que o site não usa. Use
          &quot;Partir do texto atual do site&quot; para começar de um texto completo.
        </Notice>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">Texto da página</div>
        <Button size="sm" variant="outline" onClick={fromCurrent}>
          Partir do texto atual do site
        </Button>
      </div>
      <BlocksEditor value={sections} onChange={(next) => setValue({ ...value, sections: next })} />
    </div>
  );
}

export default function LegalPage() {
  const { items, map, loading, error } = useSettings();

  return (
    <div>
      <PageHeader
        title="Páginas legais"
        description="Política de privacidade e termos de uso. Enquanto o interruptor de cada página estiver desligado, o site mantém o texto atual. Depois de salvar, em produção a mudança aparece em até 60 segundos."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <Notice tone="error">{error}</Notice>}
      {!loading && !error && items.length === 0 && (
        <div className="mb-4">
          <Notice tone="warning">{SEED_HINT}</Notice>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {(
            [
              ["legal_privacy", "Política de privacidade", legalPrivacyDefault],
              ["legal_terms", "Termos de uso", legalTermsDefault],
            ] as const
          ).map(([key, label, base]) => (
            <SettingEditor
              key={key}
              settingKey={key}
              meta={{
                label,
                description:
                  "Use “Partir do texto atual do site” para começar do texto que já está publicado e então ajustar.",
              }}
              schema={legalSchema}
              item={map[key] ?? null}
              defaultOpen={false}
              validate={(v) =>
                v.enabled === true && sectionsOf(v).length === 0
                  ? "Para ligar, adicione ao menos um bloco de texto (ou use “Partir do texto atual do site”)."
                  : null
              }
              renderExtra={(v, set) => <LegalExtra value={v} setValue={set} base={base} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
