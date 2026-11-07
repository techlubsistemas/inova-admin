"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { ptText } from "@/lib/i18n";
import { publicFormUrl } from "@/lib/site";
import { PageHeader } from "@/components/page-header";
import { Notice } from "@/components/structured/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate } from "@/components/list-kit";

type FormRow = {
  id: string;
  slug: string;
  name: string;
  title: unknown;
  published: boolean;
  submissionsCount: number;
  updatedAt: string;
};

export default function FormulariosPage() {
  const [items, setItems] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: FormRow[] }>("/cms/admin/forms")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Formulários"
        description="Formulários criados aqui ganham uma página própria no site (/formularios/endereco) e os envios chegam nesta tela."
        action={
          <Button asChild>
            <Link href="/dashboard/formularios/novo">
              <Plus className="mr-1 h-4 w-4" />
              Novo formulário
            </Link>
          </Button>
        }
      />
      <div className="mb-4">
        <Notice tone="info">
          Os campos da calculadora não aparecem aqui: eles continuam no código do site porque
          alimentam o cálculo. Os leads da calculadora ficam em Leads.
        </Notice>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Nenhum formulário ainda. Use &quot;Novo formulário&quot; para criar o primeiro.
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Link no site</th>
                <th className="px-4 py-2">Situação</th>
                <th className="px-4 py-2">Envios</th>
                <th className="px-4 py-2">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-t hover:bg-accent/40">
                  <td className="px-4 py-2">
                    <Link
                      href={`/dashboard/formularios/${f.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {f.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{ptText(f.title)}</div>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <a
                      href={publicFormUrl(f.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-primary underline"
                    >
                      /formularios/{f.slug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {f.published ? "Publicado" : "Rascunho (fora do ar)"}
                  </td>
                  <td className="px-4 py-2">{f.submissionsCount}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                    {fmtDate(f.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
