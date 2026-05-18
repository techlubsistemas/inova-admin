"use client";

import { useEffect, useState } from "react";
import { FolderArchive } from "lucide-react";
import { api } from "@/lib/api";
import { tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Material = {
  id: string;
  slug: string;
  title: { pt: string; en: string | null };
  description: { pt: string; en: string | null };
  fileUrl: string;
  fileSizeBytes: number;
  categoria: string;
  requiresEmail: boolean;
  downloadCount: number;
  published: boolean;
};

export default function MateriaisPage() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Material[] }>("/admin/materials")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Materiais (PDFs)"
        description="Biblioteca de PDFs disponíveis para download no site público. Upload na Fase 4."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {!loading && items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <FolderArchive className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm font-medium">Nenhum material cadastrado ainda</div>
            <div className="text-xs text-muted-foreground">
              Na Fase 4 você vai subir PDFs aqui e eles vão aparecer em /materiais no site.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle className="text-base">{tx(m.title)}</CardTitle>
              <CardDescription className="text-xs">
                {m.categoria} · {Math.round(m.fileSizeBytes / 1024)} KB ·{" "}
                {m.downloadCount} downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/75 line-clamp-3">
                {tx(m.description)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <ComingSoon
          fase="Fase 4"
          description="Upload de PDF (max 10MB), gestão de categorias, opção de exigir email para download (lead capture)."
        />
      </div>
    </div>
  );
}
