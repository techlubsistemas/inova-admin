"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Case = {
  id: string;
  slug: string;
  clienteAnonimo: { pt: string; en: string | null };
  setorSlug: string;
  equipamentoSlug: string;
  problemaSlug: string;
  ano: string;
  resumo: { pt: string; en: string | null };
  published: boolean;
  displayOrder: number;
};

export default function CasesPage() {
  const [items, setItems] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Case[]; total: number }>("/cms/admin/cases")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Cases"
        description={`${items.length} case${items.length === 1 ? "" : "s"} no banco. Clique para editar.`}
        action={
          <Button asChild>
            <Link href="/dashboard/cases/novo">
              <Plus className="mr-1 h-4 w-4" />
              Novo case
            </Link>
          </Button>
        }
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Link key={c.id} href={`/dashboard/cases/${c.id}`}>
            <Card className="cursor-pointer transition-colors hover:bg-accent/40">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{tx(c.clienteAnonimo)}</CardTitle>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      c.published
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.published ? "Publicado" : "Rascunho"}
                  </span>
                </div>
                <CardDescription className="text-xs">
                  {c.setorSlug} · {c.equipamentoSlug} · {c.problemaSlug} · {c.ano}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {tx(c.resumo)}
                </p>
                <div className="mt-3 text-xs text-muted-foreground">/{c.slug}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
