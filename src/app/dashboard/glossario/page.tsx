"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Term = {
  id: string;
  slug: string;
  termo: { pt: string; en: string | null };
  sigla: string | null;
  categoriaSlug: string;
  definicaoCurta: { pt: string; en: string | null };
  published: boolean;
};

export default function GlossarioPage() {
  const [items, setItems] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Term[] }>("/admin/glossary")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...items].sort((a, b) =>
    tx(a.termo).localeCompare(tx(b.termo)),
  );

  return (
    <div>
      <PageHeader
        title="Glossário"
        description={`${items.length} termos no banco. Clique num card para editar.`}
        action={
          <Button asChild>
            <Link href="/dashboard/glossario/novo">
              <Plus className="mr-1 h-4 w-4" />
              Novo termo
            </Link>
          </Button>
        }
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="grid gap-3 md:grid-cols-2">
        {sorted.map((t) => (
          <Link key={t.id} href={`/dashboard/glossario/${t.id}`}>
            <Card className="cursor-pointer transition-colors hover:bg-accent/40">
              <CardContent className="p-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{tx(t.termo)}</span>
                  {t.sigla && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {t.sigla}
                    </span>
                  )}
                  <span className="ml-auto flex gap-1">
                    {!t.published && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Rascunho
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {t.categoriaSlug}
                    </span>
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/75 line-clamp-3">
                  {tx(t.definicaoCurta)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
