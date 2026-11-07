"use client";

import { PageHeader } from "@/components/page-header";
import { SettingEditor } from "@/components/setting-editor";
import { Notice } from "@/components/structured/ui";
import { footerSchema } from "@/lib/setting-schemas";
import { SEED_HINT, useSettings } from "@/lib/use-settings";

export default function FooterPage() {
  const { items, map, loading, error } = useSettings();

  return (
    <div>
      <PageHeader
        title="Rodapé"
        description="Rodapé que aparece em todas as páginas do site: logo, colunas de links, contato e redes sociais."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <Notice tone="error">{error}</Notice>}
      {!loading && !error && items.length === 0 && (
        <div className="mb-4">
          <Notice tone="warning">{SEED_HINT}</Notice>
        </div>
      )}

      {!loading && !error && (
        <SettingEditor
          settingKey="footer"
          meta={{
            label: "Rodapé",
            description:
              "Vale para todas as páginas. Em produção, a mudança aparece em até 60 segundos.",
          }}
          schema={footerSchema}
          item={map.footer ?? null}
          previewable
        />
      )}
    </div>
  );
}
