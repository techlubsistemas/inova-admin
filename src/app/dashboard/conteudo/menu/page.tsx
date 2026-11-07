"use client";

import { PageHeader } from "@/components/page-header";
import { SettingEditor } from "@/components/setting-editor";
import { Notice } from "@/components/structured/ui";
import { navSchema } from "@/lib/setting-schemas";
import { SEED_HINT, useSettings } from "@/lib/use-settings";

export default function MenuPage() {
  const { items, map, loading, error } = useSettings();

  return (
    <div>
      <PageHeader
        title="Menu do topo"
        description="Links do menu que aparece no topo de todas as páginas, e o botão de destaque."
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
          settingKey="nav"
          meta={{
            label: "Menu do topo",
            description:
              "Se nenhum link for salvo, o site continua com o menu atual. Em produção, a mudança aparece em até 60 segundos.",
          }}
          schema={navSchema}
          item={map.nav ?? null}
          previewable
        />
      )}
    </div>
  );
}
