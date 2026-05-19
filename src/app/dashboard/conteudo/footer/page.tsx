"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { SettingEditor, type Setting } from "@/components/setting-editor";

export default function FooterPage() {
  const [setting, setSetting] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: Setting }>("/cms/admin/settings/footer")
      .then((d) => setSetting(d.item))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Footer"
        description="Rodapé global: logo, colunas de links, contato, redes sociais."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {setting && (
        <SettingEditor
          item={setting}
          meta={{
            label: "Footer",
            description:
              "Campos esperados: brand{logoUrl,description}, columns[{title,links[{label,href}]}], contact{email,phone,address}, socials[{icon,href}].",
          }}
          onSaved={setSetting}
        />
      )}
    </div>
  );
}
