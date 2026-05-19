"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ArticleForm } from "@/components/article-form";

type ArticleFull = {
  id: string;
  slug: string;
  title: { pt: string; en: string | null };
  excerpt: { pt: string; en: string | null };
  categoriaSlug: string;
  tags: string[];
  autorNome: string;
  autorCargo: { pt: string; en: string | null };
  publicadoEm: string;
  tempoLeituraMin: number;
  heroImageUrl: string | null;
  destaque: boolean;
  content: unknown[];
  seoTitle: { pt: string; en: string | null } | null;
  seoDescription: { pt: string; en: string | null } | null;
  ogImageUrl: string | null;
  published: boolean;
};

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

  return (
    <div>
      <PageHeader
        title={`Editar artigo: ${item.title.pt}`}
        description={`Slug atual: /${item.slug}`}
      />
      <ArticleForm
        mode="edit"
        id={item.id}
        defaultValues={{
          slug: item.slug,
          titlePt: item.title.pt,
          excerptPt: item.excerpt.pt,
          categoriaSlug: item.categoriaSlug,
          tagsText: (item.tags ?? []).join(", "),
          autorNome: item.autorNome,
          autorCargoPt: item.autorCargo.pt,
          publicadoEm: new Date(item.publicadoEm).toISOString().slice(0, 10),
          tempoLeituraMin: item.tempoLeituraMin,
          heroImageUrl: item.heroImageUrl ?? "",
          destaque: item.destaque,
          contentJson: JSON.stringify(item.content ?? [], null, 2),
          seoTitleText: item.seoTitle?.pt ?? "",
          seoDescriptionText: item.seoDescription?.pt ?? "",
          ogImageUrl: item.ogImageUrl ?? "",
          published: item.published,
        }}
      />
    </div>
  );
}
