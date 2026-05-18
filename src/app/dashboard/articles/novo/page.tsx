import { PageHeader } from "@/components/page-header";
import { ArticleForm } from "@/components/article-form";

export default function NovoArticlePage() {
  return (
    <div>
      <PageHeader title="Novo artigo" description="Adicionar um artigo técnico ao blog." />
      <ArticleForm mode="create" />
    </div>
  );
}
