"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { CaseForm } from "@/components/case-form";

type CaseFull = {
  id: string;
  slug: string;
  clienteAnonimo: { pt: string; en: string | null };
  setorSlug: string;
  equipamentoSlug: string;
  problemaSlug: string;
  ano: string;
  duracao: { pt: string; en: string | null };
  resumo: { pt: string; en: string | null };
  heroImageUrl: string | null;
  desafio: { pt: string[]; en: string[] | null };
  diagnostico: { pt: string[]; en: string[] | null };
  solucao: { pt: string[]; en: string[] | null };
  kpis: unknown[];
  depoimento: {
    quote: { pt: string; en: string | null };
    autor: string;
    cargo: { pt: string; en: string | null };
  } | null;
  seoTitle: { pt: string; en: string | null } | null;
  seoDescription: { pt: string; en: string | null } | null;
  ogImageUrl: string | null;
  published: boolean;
  displayOrder: number;
};

export default function EditCasePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<CaseFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[edit-case] mount, id =", id);
    api
      .get<{ item: CaseFull }>(`/admin/cases/${id}`)
      .then((d) => {
        console.log("[edit-case] GET ok, item:", d.item);
        setItem(d.item);
      })
      .catch((e) => {
        console.error("[edit-case] GET failed", {
          message: e.message,
          status: e.status,
          details: e.details,
        });
        setError(`${e.message} (status ${e.status ?? "?"})`);
      });
  }, [id]);

  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!item) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <PageHeader
        title={`Editar case: ${item.clienteAnonimo.pt}`}
        description={`Slug atual: /${item.slug}`}
      />
      <CaseForm
        mode="edit"
        id={item.id}
        defaultValues={{
          slug: item.slug,
          clienteAnonimoText: item.clienteAnonimo.pt,
          setorSlug: item.setorSlug,
          equipamentoSlug: item.equipamentoSlug,
          problemaSlug: item.problemaSlug,
          ano: item.ano,
          duracaoText: item.duracao.pt,
          resumoText: item.resumo.pt,
          heroImageUrl: item.heroImageUrl ?? "",
          desafioText: (item.desafio?.pt ?? []).join("\n\n"),
          diagnosticoText: (item.diagnostico?.pt ?? []).join("\n\n"),
          solucaoText: (item.solucao?.pt ?? []).join("\n\n"),
          kpisJson: JSON.stringify(item.kpis ?? [], null, 2),
          depoimentoQuoteText: item.depoimento?.quote?.pt ?? "",
          depoimentoAutor: item.depoimento?.autor ?? "",
          depoimentoCargoText: item.depoimento?.cargo?.pt ?? "",
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
