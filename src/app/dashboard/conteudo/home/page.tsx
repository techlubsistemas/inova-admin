"use client";

import { PageHeader } from "@/components/page-header";
import { SettingEditor } from "@/components/setting-editor";
import { Notice } from "@/components/structured/ui";
import { HOME_SETTINGS } from "@/lib/setting-schemas";
import { SEED_HINT, useSettings } from "@/lib/use-settings";

export default function ContentHomePage() {
  const { items, map, loading, error } = useSettings();

  return (
    <div>
      <PageHeader
        title="Conteúdo da home"
        description="Edite os textos, imagens e botões de cada seção da página inicial. Em produção, o que você salvar aparece no site em até 60 segundos."
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
          {HOME_SETTINGS.map((s, i) => (
            <SettingEditor
              key={s.key}
              settingKey={s.key}
              meta={{ label: s.label, description: s.description }}
              schema={s.schema}
              item={map[s.key] ?? null}
              defaultOpen={i === 0}
              previewable
            />
          ))}
        </div>
      )}
    </div>
  );
}
