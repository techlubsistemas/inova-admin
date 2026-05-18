import { PageHeader } from "@/components/page-header";
import { SectorForm } from "@/components/sector-form";

export default function NovoSetorPage() {
  return (
    <div>
      <PageHeader title="Novo setor" description="Adicionar um setor industrial." />
      <SectorForm mode="create" />
    </div>
  );
}
