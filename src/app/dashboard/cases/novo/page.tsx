import { PageHeader } from "@/components/page-header";
import { CaseForm } from "@/components/case-form";

export default function NovoCasePage() {
  return (
    <div>
      <PageHeader title="Novo case" description="Adicionar um case de sucesso ao portfólio." />
      <CaseForm mode="create" />
    </div>
  );
}
