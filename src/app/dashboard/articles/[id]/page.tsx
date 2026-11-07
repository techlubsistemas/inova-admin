"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ptText } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { ArticleForm, type ArticleFull } from "@/components/article-form";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<ArticleFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: ArticleFull }>(`/cms/admin/articles/${id}`)
      .then((d) => setItem(d.item))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!item) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  // O conteúdo pode estar no formato antigo ({ pt: [...] }) ou como lista: o formulário
  // lê os dois sem perder blocos, e as traduções (en) dos textos são preservadas.
  return (
    <div>
      <PageHeader
        title={`Editar artigo: ${ptText(item.title)}`}
        description={`Endereço atual: /blog/${item.slug}`}
      />
      <ArticleForm mode="edit" original={item} />
    </div>
  );
}
