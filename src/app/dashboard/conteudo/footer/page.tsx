"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
import { JsonPreview } from "@/components/json-preview";
import { Card, CardContent } from "@/components/ui/card";

type Setting = { key: string; value: unknown };

export default function FooterPage() {
  const [setting, setSetting] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: Setting }>("/admin/settings/footer")
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
        <Card>
          <CardContent className="p-6">
            <JsonPreview value={setting.value} />
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <ComingSoon
          fase="Fase 3"
          description="Editor do footer com forms para email/telefone/endereço, gerenciar colunas de links e redes sociais."
        />
      </div>
    </div>
  );
}
