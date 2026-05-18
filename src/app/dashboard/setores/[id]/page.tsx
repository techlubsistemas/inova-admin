"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { SectorForm } from "@/components/sector-form";

type SectorFull = {
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
  seoTitle: { pt: string; en: string | null } | null;
  seoDescription: { pt: string; en: string | null } | null;
  ogImageUrl: string | null;
  published: boolean;
  displayOrder: number;
};

export default function EditSetorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<SectorFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: SectorFull }>(`/admin/sectors/${id}`)
      .then((d) => setItem(d.item))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!item) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <PageHeader
        title={`Editar setor: ${item.nome.pt}`}
        description={`Slug atual: /${item.slug}`}
      />
      <SectorForm
        mode="edit"
        id={item.id}
        defaultValues={{
          slug: item.slug,
          nomePt: item.nome.pt,
          taglinePt: item.tagline.pt,
          descricaoPt: item.descricao.pt,
          heroImageUrl: item.heroImageUrl ?? "",
          equipamentosJson: JSON.stringify(item.equipamentosTipicos ?? [], null, 2),
          problemasJson: JSON.stringify(item.problemasComuns ?? [], null, 2),
          regulamentacaoJson: JSON.stringify(item.regulamentacao ?? [], null, 2),
          faqsJson: JSON.stringify(item.faqs ?? [], null, 2),
          seoTitleText: item.seoTitle?.pt ?? "",
          seoDescriptionText: item.seoDescription?.pt ?? "",
          ogImageUrl: item.ogImageUrl ?? "",
          published: item.published,
          displayOrder: item.displayOrder,
        }}
      />
    </div>
  );
}
