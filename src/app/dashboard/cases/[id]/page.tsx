"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ptText } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { CaseForm, type CaseFull } from "@/components/case-form";

export default function EditCasePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<CaseFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: CaseFull }>(`/cms/admin/cases/${id}`)
      .then((d) => setItem(d.item))
      .catch((e) => setError(`${e.message}${e.status ? ` (erro ${e.status})` : ""}`));
  }, [id]);

  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!item) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <PageHeader
        title={`Editar case: ${ptText(item.clienteAnonimo)}`}
        description={`Endereço atual: /cases/${item.slug}`}
      />
      <CaseForm mode="edit" original={item} />
    </div>
  );
}
