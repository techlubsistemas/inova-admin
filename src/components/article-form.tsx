"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIAS = [
  "analise-de-oleo",
  "lubrificacao-industrial",
  "confiabilidade",
  "manutencao-preditiva",
  "gestao",
  "treinamento",
  "cases",
  "normas",
];

const schema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  titlePt: z.string().min(1, "Título obrigatório"),
  excerptPt: z.string().min(1, "Resumo obrigatório"),
  categoriaSlug: z.string().min(1, "Categoria obrigatória"),
  tagsText: z.string().optional(),
  autorNome: z.string().min(1, "Autor obrigatório"),
  autorCargoPt: z.string().min(1, "Cargo obrigatório"),
  publicadoEm: z.string().min(1, "Data de publicação obrigatória"),
  tempoLeituraMin: z.number().int().min(1),
  heroImageUrl: z.string().optional(),
  destaque: z.boolean().default(false),
  contentJson: z.string().min(2, "Conteúdo obrigatório (JSON)"),
  seoTitleText: z.string().optional(),
  seoDescriptionText: z.string().optional(),
  ogImageUrl: z.string().optional(),
  published: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export function ArticleForm({
  defaultValues,
  id,
  mode,
}: {
  defaultValues?: Partial<FormData>;
  id?: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      titlePt: "",
      excerptPt: "",
      categoriaSlug: "lubrificacao-industrial",
      tagsText: "",
      autorNome: "Inova Lubrificantes",
      autorCargoPt: "Equipe técnica",
      publicadoEm: new Date().toISOString().slice(0, 10),
      tempoLeituraMin: 5,
      heroImageUrl: "",
      destaque: false,
      contentJson: JSON.stringify(
        [{ type: "paragraph", content: { pt: "Conteúdo aqui…", en: null } }],
        null,
        2,
      ),
      seoTitleText: "",
      seoDescriptionText: "",
      ogImageUrl: "",
      published: true,
      ...defaultValues,
    },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    let content: unknown[];
    try {
      content = JSON.parse(data.contentJson);
      if (!Array.isArray(content)) throw new Error("Content deve ser array");
    } catch {
      setServerError("Conteúdo: JSON inválido.");
      return;
    }
    const payload = {
      slug: data.slug,
      title: { pt: data.titlePt, en: null },
      excerpt: { pt: data.excerptPt, en: null },
      categoriaSlug: data.categoriaSlug,
      tags: data.tagsText
        ? data.tagsText.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      autorNome: data.autorNome,
      autorCargo: { pt: data.autorCargoPt, en: null },
      publicadoEm: data.publicadoEm,
      tempoLeituraMin: data.tempoLeituraMin,
      heroImageUrl: data.heroImageUrl?.trim() || null,
      destaque: data.destaque,
      content,
      seoTitle: data.seoTitleText?.trim()
        ? { pt: data.seoTitleText.trim(), en: null }
        : null,
      seoDescription: data.seoDescriptionText?.trim()
        ? { pt: data.seoDescriptionText.trim(), en: null }
        : null,
      ogImageUrl: data.ogImageUrl?.trim() || null,
      published: data.published,
    };
    try {
      if (mode === "create") {
        await api.post("/admin/articles", payload);
      } else if (id) {
        await api.put(`/admin/articles/${id}`, payload);
      }
      router.push("/dashboard/articles");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Deletar este artigo? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/admin/articles/${id}`);
      router.push("/dashboard/articles");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  const fieldCls = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">

      {/* Slug */}
      <div className="space-y-1">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" {...register("slug")} placeholder="ex: como-escolher-viscosidade" />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      {/* Título */}
      <div className="space-y-1">
        <Label htmlFor="titlePt">Título</Label>
        <Input id="titlePt" {...register("titlePt")} />
        {errors.titlePt && <p className="text-xs text-destructive">{errors.titlePt.message}</p>}
      </div>

      {/* Resumo */}
      <div className="space-y-1">
        <Label htmlFor="excerptPt">Resumo (excerpt)</Label>
        <textarea id="excerptPt" rows={3} {...register("excerptPt")} className={fieldCls} />
        {errors.excerptPt && <p className="text-xs text-destructive">{errors.excerptPt.message}</p>}
      </div>

      {/* Categoria + tags */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="categoriaSlug">Categoria</Label>
          <select id="categoriaSlug" {...register("categoriaSlug")} className={fieldCls}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.categoriaSlug && <p className="text-xs text-destructive">{errors.categoriaSlug.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tagsText">Tags (separadas por vírgula)</Label>
          <Input id="tagsText" {...register("tagsText")} placeholder="ex: iso, viscosidade, redutor" />
        </div>
      </div>

      {/* Autor */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="autorNome">Autor</Label>
          <Input id="autorNome" {...register("autorNome")} />
          {errors.autorNome && <p className="text-xs text-destructive">{errors.autorNome.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="autorCargoPt">Cargo do autor</Label>
          <Input id="autorCargoPt" {...register("autorCargoPt")} placeholder="ex: Especialista em Lubrificação" />
          {errors.autorCargoPt && <p className="text-xs text-destructive">{errors.autorCargoPt.message}</p>}
        </div>
      </div>

      {/* Data + tempo de leitura + hero */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="publicadoEm">Publicado em</Label>
          <Input id="publicadoEm" type="date" {...register("publicadoEm")} />
          {errors.publicadoEm && <p className="text-xs text-destructive">{errors.publicadoEm.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tempoLeituraMin">Leitura (min)</Label>
          <Input
            id="tempoLeituraMin"
            type="number"
            min={1}
            {...register("tempoLeituraMin", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="heroImageUrl">Hero image URL</Label>
          <Input id="heroImageUrl" {...register("heroImageUrl")} placeholder="/blog-hero.png" />
        </div>
      </div>

      {/* Conteúdo JSON */}
      <div className="space-y-1">
        <Label htmlFor="contentJson">
          Conteúdo (JSON) — array de seções{" "}
          <code className="rounded bg-muted px-1 text-[10px]">
            {"[{ type, content:{pt,en} }, ...]"}
          </code>
        </Label>
        <textarea
          id="contentJson"
          rows={12}
          {...register("contentJson")}
          className={`${fieldCls} font-mono text-xs`}
        />
        {errors.contentJson && <p className="text-xs text-destructive">{errors.contentJson.message}</p>}
      </div>

      {/* SEO */}
      <fieldset className="space-y-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">SEO (opcional)</legend>
        <div className="space-y-1">
          <Label htmlFor="seoTitleText">SEO Title</Label>
          <Input id="seoTitleText" {...register("seoTitleText")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="seoDescriptionText">SEO Description</Label>
          <textarea id="seoDescriptionText" rows={2} {...register("seoDescriptionText")} className={fieldCls} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ogImageUrl">OG Image URL</Label>
          <Input id="ogImageUrl" {...register("ogImageUrl")} />
        </div>
      </fieldset>

      {/* Flags */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <input id="destaque" type="checkbox" {...register("destaque")} className="h-4 w-4 rounded border-input" />
          <Label htmlFor="destaque" className="cursor-pointer">Artigo em destaque</Label>
        </div>
        <div className="flex items-center gap-2">
          <input id="published" type="checkbox" {...register("published")} className="h-4 w-4 rounded border-input" />
          <Label htmlFor="published" className="cursor-pointer">Publicado no site</Label>
        </div>
      </div>

      {serverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar artigo" : "Salvar alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/articles")}>
            Cancelar
          </Button>
        </div>
        {mode === "edit" && (
          <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={isSubmitting}>
            <Trash2 className="mr-1 h-3 w-3" />
            Deletar
          </Button>
        )}
      </div>
    </form>
  );
}
