"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { GlossaryForm } from "@/components/glossary-form";

type Term = {
  id: string;
  slug: string;
  termo: { pt: string; en: string | null };
  sigla: string | null;
  categoriaSlug: "medicao" | "tecnica" | "certificacao" | "equipamento" | "norma";
  definicaoCurta: { pt: string; en: string | null };
  definicaoLonga: { pt: string[]; en: string[] | null };
  termosRelacionados: string[] | null;
  published: boolean;
};

export default function EditGlossarioPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [term, setTerm] = useState<Term | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: Term }>(`/admin/glossary/${id}`)
      .then((d) => setTerm(d.item))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return <div className="text-sm text-destructive">{error}</div>;
  if (!term)
    return <div className="text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <PageHeader
        title={`Editar termo: ${term.termo.pt}`}
        description={`Slug atual: /${term.slug}`}
      />
      <GlossaryForm
        mode="edit"
        id={term.id}
        defaultValues={{
          slug: term.slug,
          termo: term.termo,
          sigla: term.sigla ?? "",
          categoriaSlug: term.categoriaSlug,
          definicaoCurta: term.definicaoCurta,
          definicaoLongaText: (term.definicaoLonga?.pt ?? []).join("\n\n"),
          termosRelacionadosText: (term.termosRelacionados ?? []).join(", "),
          published: term.published,
        }}
      />
    </div>
  );
}
