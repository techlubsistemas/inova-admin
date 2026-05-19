"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Sector = {
  id: string;
  slug: string;
  nome: { pt: string; en: string | null };
  tagline: { pt: string; en: string | null };
  descricao: { pt: string; en: string | null };
  heroImageUrl: string | null;
  equipamentosTipicos: unknown[];
  problemasComuns: unknown[];
  regulamentacao: unknown[];
  faqs: unknown[] | null;
  published: boolean;
  displayOrder: number;
};

export default function SetoresPage() {
  const [items, setItems] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Sector[] }>("/cms/admin/sectors")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Setores industriais"
        description={`${items.length} setores. Clique para editar.`}
        action={
          <Button asChild>
            <Link href="/dashboard/setores/novo">
              <Plus className="mr-1 h-4 w-4" />
              Novo setor
            </Link>
          </Button>
        }
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((s) => (
          <Link key={s.id} href={`/dashboard/setores/${s.id}`}>
          <Card className="cursor-pointer transition-colors hover:bg-accent/40">
            <CardHeader>
              <CardTitle className="text-base">{tx(s.nome)}</CardTitle>
              <CardDescription className="text-xs italic">
                {tx(s.tagline)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/75 line-clamp-3">
                {tx(s.descricao)}
              </p>
              <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground">
                <span>{s.equipamentosTipicos?.length || 0} equipamentos</span>
                <span>·</span>
                <span>{s.problemasComuns?.length || 0} problemas</span>
                <span>·</span>
                <span>{s.regulamentacao?.length || 0} normas</span>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
