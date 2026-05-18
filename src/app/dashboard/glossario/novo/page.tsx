import { PageHeader } from "@/components/page-header";
import { GlossaryForm } from "@/components/glossary-form";

export default function NovoGlossarioPage() {
  return (
    <div>
      <PageHeader
        title="Novo termo do glossário"
        description="Adicionar um termo técnico ao glossário."
      />
      <GlossaryForm mode="create" />
    </div>
  );
}
