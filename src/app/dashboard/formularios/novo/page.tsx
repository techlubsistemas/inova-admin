"use client";

import { PageHeader } from "@/components/page-header";
import { FormEditor } from "@/components/forms/form-editor";

export default function NovoFormularioPage() {
  return (
    <div>
      <PageHeader
        title="Novo formulário"
        description="Defina os dados e os campos. Ele só aparece no site depois de marcado como publicado."
      />
      <FormEditor mode="create" />
    </div>
  );
}
