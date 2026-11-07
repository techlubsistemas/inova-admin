"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { FormEditor, type FormFull } from "@/components/forms/form-editor";
import { Submissions } from "@/components/forms/submissions";

export default function EditFormularioPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<FormFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "subs">("edit");

  useEffect(() => {
    api
      .get<{ item: FormFull }>(`/cms/admin/forms/${id}`)
      .then((d) => setItem(d.item))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!item) return <div className="text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <PageHeader
        title={`Formulário: ${item.name}`}
        description={`${item.submissionsCount ?? 0} envio(s) recebido(s).`}
      />
      <div className="mb-4 flex gap-1 border-b">
        {(
          [
            ["edit", "Editar formulário"],
            ["subs", "Envios"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              tab === k
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* As duas abas ficam montadas para não perder o que foi digitado ao trocar. */}
      <div className={tab === "edit" ? "" : "hidden"}>
        <FormEditor mode="edit" original={item} onSaved={(f) => setItem({ ...item, ...f })} />
      </div>
      <div className={tab === "subs" ? "" : "hidden"}>
        <Submissions formId={item.id} fields={item.fields} />
      </div>
    </div>
  );
}
