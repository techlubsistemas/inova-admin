"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ptText } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { SectorForm, type SectorFull } from "@/components/sector-form";

export default function EditSetorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<SectorFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: SectorFull }>(`/cms/admin/sectors/${id}`)
      .then((d) => setItem(d.item))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!item) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <PageHeader
        title={`Editar setor: ${ptText(item.nome)}`}
        description={`Endereço atual: /industrias/${item.slug}`}
      />
      <SectorForm mode="edit" original={item} />
    </div>
  );
}
