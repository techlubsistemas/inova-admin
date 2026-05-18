"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { tx } from "@/lib/i18n";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Article = {
  id: string;
  slug: string;
  title: { pt: string; en: string | null };
  excerpt: { pt: string; en: string | null };
  categoriaSlug: string;
  tags: string[];
  autorNome: string;
  publicadoEm: string;
  tempoLeituraMin: number;
  destaque: boolean;
  published: boolean;
};

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("todos");

  useEffect(() => {
    api
      .get<{ items: Article[] }>("/admin/articles")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categorias = Array.from(new Set(items.map((i) => i.categoriaSlug)));
  const visible =
    filter === "todos" ? items : items.filter((i) => i.categoriaSlug === filter);

  return (
    <div>
      <PageHeader
        title="Artigos"
        description={`${items.length} artigo${items.length === 1 ? "" : "s"} no banco. Clique para editar.`}
        action={
          <Button asChild>
            <Link href="/dashboard/articles/novo">
              <Plus className="mr-1 h-4 w-4" />
              Novo artigo
            </Link>
          </Button>
        }
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {!loading && !error && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterPill
              label={`Todos (${items.length})`}
              active={filter === "todos"}
              onClick={() => setFilter("todos")}
            />
            {categorias.map((cat) => {
              const count = items.filter((i) => i.categoriaSlug === cat).length;
              return (
                <FilterPill
                  key={cat}
                  label={`${cat} (${count})`}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                />
              );
            })}
          </div>

          <div className="space-y-2">
            {visible.map((a) => (
              <Link key={a.id} href={`/dashboard/articles/${a.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-accent/40">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{tx(a.title)}</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {a.categoriaSlug} · {a.tempoLeituraMin} min · por{" "}
                        {a.autorNome} ·{" "}
                        {new Date(a.publicadoEm).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {a.destaque && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Destaque
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          a.published
                            ? "bg-green-100 text-green-800"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {a.published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground/70 line-clamp-2">
                    {tx(a.excerpt)}
                  </p>
                  {a.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.tags.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/70 hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}
