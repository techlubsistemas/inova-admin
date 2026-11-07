"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { i18nOptionalPayload, i18nPayload, ptText } from "@/lib/i18n";
import { CATEGORIAS_BLOG } from "@/lib/taxonomy";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlocksEditor, type Block } from "@/components/blocks-editor";
import { ImageField } from "@/components/image-field";
import { OptionSelect, taxonomyOptions } from "@/components/option-select";
import { StructuredEditor } from "@/components/structured/structured-editor";
import { Notice, fieldCls } from "@/components/structured/ui";
import type { Schema } from "@/components/structured/types";

export type ArticleFull = {
  id: string;
  slug: string;
  title: unknown;
  excerpt: unknown;
  categoriaSlug: string;
  tags: string[];
  autorNome: string;
  autorCargo: unknown;
  publicadoEm: string;
  tempoLeituraMin: number;
  heroImageUrl: string | null;
  heroImageAlt?: unknown;
  destaque: boolean;
  content: unknown;
  ctaContextual?: Record<string, unknown> | null;
  seoTitle: unknown;
  seoDescription: unknown;
  ogImageUrl: string | null;
  published: boolean;
};

const schema = z.object({
  slug: z
    .string()
    .min(2, "Informe o endereço do artigo")
    .regex(/^[a-z0-9-]+$/, "Use só letras minúsculas sem acento, números e hífens"),
  titlePt: z.string().min(1, "Título obrigatório"),
  excerptPt: z.string().min(1, "Resumo obrigatório"),
  categoriaSlug: z.string().min(1, "Categoria obrigatória"),
  tagsText: z.string().optional(),
  autorNome: z.string().min(1, "Autor obrigatório"),
  autorCargoPt: z.string().min(1, "Cargo obrigatório"),
  publicadoEm: z.string().min(1, "Data de publicação obrigatória"),
  tempoLeituraMin: z
    .number({ invalid_type_error: "Informe o tempo de leitura em minutos" })
    .int("Use um número inteiro")
    .min(1, "Mínimo de 1 minuto"),
  heroImageUrl: z.string().optional(),
  heroImageAltPt: z.string().optional(),
  destaque: z.boolean().default(false),
  seoTitleText: z.string().optional(),
  seoDescriptionText: z.string().optional(),
  ogImageUrl: z.string().optional(),
  published: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

const ctaSchema: Schema = [
  {
    type: "optionalGroup",
    key: "ctaContextual",
    label: "Chamada no final do artigo",
    toggleLabel: "Usar uma chamada personalizada",
    help: "Sem chamada personalizada, o site mostra um convite padrão para falar com um especialista.",
    create: () => ({
      title: { pt: "", en: null },
      description: { pt: "", en: null },
      label: { pt: "", en: null },
      href: "/calculadora",
    }),
    fields: [
      { type: "i18n", key: "title", label: "Título da chamada" },
      { type: "i18n", key: "description", label: "Texto da chamada", multiline: true },
      { type: "i18n", key: "label", label: "Texto do botão" },
      { type: "link", key: "href", label: "Para onde o botão leva" },
    ],
  },
];

/** Conteúdo pode vir como array ou como { pt: [...], en }. Sempre devolve a lista de blocos. */
export function contentToBlocks(content: unknown): Block[] {
  const list = Array.isArray(content)
    ? content
    : content &&
        typeof content === "object" &&
        Array.isArray((content as Record<string, unknown>).pt)
      ? ((content as Record<string, unknown>).pt as unknown[])
      : [];
  return list.filter((b): b is Block => typeof b === "object" && b !== null && !Array.isArray(b));
}

/** Há uma versão em inglês do conteúdo que o formato de gravação (lista) não comporta. */
function hasEnglishContent(content: unknown): boolean {
  if (!content || typeof content !== "object" || Array.isArray(content)) return false;
  const en = (content as Record<string, unknown>).en;
  return Array.isArray(en) && en.length > 0;
}

function dateOnly(iso: string | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export function ArticleForm({
  original,
  mode,
}: {
  original?: ArticleFull;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>(() => contentToBlocks(original?.content));
  const [cta, setCta] = useState<Record<string, unknown>>({
    ctaContextual: original?.ctaContextual ?? null,
  });
  const [initialExtra] = useState(() => JSON.stringify({ b: blocks, c: cta }));
  const extraDirty = JSON.stringify({ b: blocks, c: cta }) !== initialExtra;

  const defaults = useMemo<FormValues>(
    () => ({
      slug: original?.slug ?? "",
      titlePt: ptText(original?.title),
      excerptPt: ptText(original?.excerpt),
      categoriaSlug: original?.categoriaSlug ?? "analise",
      tagsText: (original?.tags ?? []).join(", "),
      autorNome: original?.autorNome ?? "Inova Lubrificantes",
      autorCargoPt: original ? ptText(original.autorCargo) : "Equipe técnica",
      publicadoEm: dateOnly(original?.publicadoEm),
      tempoLeituraMin: original?.tempoLeituraMin ?? 5,
      heroImageUrl: original?.heroImageUrl ?? "",
      heroImageAltPt: ptText(original?.heroImageAlt),
      destaque: original?.destaque ?? false,
      seoTitleText: ptText(original?.seoTitle),
      seoDescriptionText: ptText(original?.seoDescription),
      ogImageUrl: original?.ogImageUrl ?? "",
      published: original?.published ?? true,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useUnsavedWarning(isDirty || extraDirty);

  const englishLost = original ? hasEnglishContent(original.content) : false;

  async function onSubmit(data: FormValues) {
    setServerError(null);
    if (
      englishLost &&
      !confirm(
        "Este artigo tem uma versão em inglês do conteúdo que o painel não consegue guardar ao salvar. Ao continuar, só o conteúdo em português será mantido. Deseja continuar?",
      )
    ) {
      return;
    }
    const o = original;
    const payload = {
      slug: data.slug,
      title: i18nPayload(o?.title, data.titlePt),
      excerpt: i18nPayload(o?.excerpt, data.excerptPt),
      categoriaSlug: data.categoriaSlug,
      tags: data.tagsText
        ? data.tagsText.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      autorNome: data.autorNome,
      autorCargo: i18nPayload(o?.autorCargo, data.autorCargoPt),
      // Se a data não mudou, devolve o valor original (com hora) em vez de "meia-noite".
      publicadoEm:
        o && data.publicadoEm === dateOnly(o.publicadoEm) ? o.publicadoEm : data.publicadoEm,
      tempoLeituraMin: data.tempoLeituraMin,
      heroImageUrl: data.heroImageUrl?.trim() || null,
      heroImageAlt: i18nOptionalPayload(o?.heroImageAlt, data.heroImageAltPt ?? ""),
      destaque: data.destaque,
      content: blocks,
      ctaContextual: cta.ctaContextual ?? (o?.ctaContextual == null ? undefined : null),
      seoTitle: i18nOptionalPayload(o?.seoTitle, data.seoTitleText ?? ""),
      seoDescription: i18nOptionalPayload(o?.seoDescription, data.seoDescriptionText ?? ""),
      ogImageUrl: data.ogImageUrl?.trim() || null,
      published: data.published,
    };
    try {
      if (mode === "create") {
        await api.post("/cms/admin/articles", payload);
      } else if (o) {
        await api.put(`/cms/admin/articles/${o.id}`, payload);
      }
      router.push("/dashboard/articles");
    } catch (err) {
      // Erro: o formulário continua preenchido.
      setServerError(
        err instanceof ApiError ? `Não foi possível salvar: ${err.message}` : "Erro inesperado ao salvar.",
      );
    }
  }

  async function onDelete() {
    if (!original) return;
    if (!confirm("Excluir este artigo? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/cms/admin/articles/${original.id}`);
      router.push("/dashboard/articles");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  const hero = watch("heroImageUrl") ?? "";
  const og = watch("ogImageUrl") ?? "";
  const categoria = watch("categoriaSlug");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
      <div className="space-y-1">
        <Label htmlFor="slug">Endereço do artigo (slug)</Label>
        <Input id="slug" {...register("slug")} placeholder="ex: como-escolher-viscosidade" />
        <p className="text-[11px] text-muted-foreground">
          É a parte final do link do artigo (/blog/<b>endereço</b>). Use letras minúsculas sem
          acento, números e hífens. Trocar o endereço de um artigo publicado muda o link dele.
        </p>
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="titlePt">Título</Label>
        <Input id="titlePt" {...register("titlePt")} />
        {errors.titlePt && <p className="text-xs text-destructive">{errors.titlePt.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="excerptPt">Resumo</Label>
        <textarea id="excerptPt" rows={3} {...register("excerptPt")} className={fieldCls} />
        {errors.excerptPt && <p className="text-xs text-destructive">{errors.excerptPt.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="categoriaSlug">Categoria</Label>
          <OptionSelect
            id="categoriaSlug"
            value={categoria}
            onChange={(v) => setValue("categoriaSlug", v, { shouldDirty: true })}
            options={taxonomyOptions(CATEGORIAS_BLOG)}
          />
          {errors.categoriaSlug && (
            <p className="text-xs text-destructive">{errors.categoriaSlug.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tagsText">Etiquetas (separadas por vírgula)</Label>
          <Input id="tagsText" {...register("tagsText")} placeholder="ex: iso, viscosidade, redutor" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="autorNome">Autor</Label>
          <Input id="autorNome" {...register("autorNome")} />
          {errors.autorNome && <p className="text-xs text-destructive">{errors.autorNome.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="autorCargoPt">Cargo do autor</Label>
          <Input id="autorCargoPt" {...register("autorCargoPt")} placeholder="ex: Especialista em Lubrificação" />
          {errors.autorCargoPt && (
            <p className="text-xs text-destructive">{errors.autorCargoPt.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="publicadoEm">Publicado em</Label>
          <Input id="publicadoEm" type="date" {...register("publicadoEm")} />
          {errors.publicadoEm && (
            <p className="text-xs text-destructive">{errors.publicadoEm.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tempoLeituraMin">Tempo de leitura (minutos)</Label>
          <Input
            id="tempoLeituraMin"
            type="number"
            min={1}
            {...register("tempoLeituraMin", { valueAsNumber: true })}
          />
          {errors.tempoLeituraMin && (
            <p className="text-xs text-destructive">{errors.tempoLeituraMin.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="heroImageUrl">Imagem de capa</Label>
        <ImageField
          id="heroImageUrl"
          value={hero}
          onChange={(v) => setValue("heroImageUrl", v, { shouldDirty: true })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="heroImageAltPt">Descrição da imagem de capa (para leitores de tela)</Label>
        <Input
          id="heroImageAltPt"
          {...register("heroImageAltPt")}
          placeholder="Se vazio, o site usa o título do artigo"
        />
      </div>

      <div className="space-y-2">
        <Label>Conteúdo do artigo</Label>
        <p className="text-[11px] text-muted-foreground">
          Monte o texto em blocos: títulos, parágrafos, listas, citações, destaques e tabelas. Use
          as setas para mudar a ordem.
        </p>
        {englishLost && (
          <Notice tone="warning">
            Este artigo tem uma versão em inglês do conteúdo. O painel edita apenas o português;
            ao salvar, você será avisado antes de a versão em inglês ser descartada.
          </Notice>
        )}
        <BlocksEditor value={blocks} onChange={setBlocks} />
      </div>

      <StructuredEditor schema={ctaSchema} value={cta} onChange={setCta} />

      <fieldset className="space-y-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Aparência no Google e nas redes (opcional)</legend>
        <div className="space-y-1">
          <Label htmlFor="seoTitleText">Título para o Google</Label>
          <Input id="seoTitleText" {...register("seoTitleText")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="seoDescriptionText">Descrição para o Google</Label>
          <textarea id="seoDescriptionText" rows={2} {...register("seoDescriptionText")} className={fieldCls} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ogImageUrl">Imagem para compartilhar nas redes</Label>
          <ImageField
            id="ogImageUrl"
            value={og}
            onChange={(v) => setValue("ogImageUrl", v, { shouldDirty: true })}
          />
        </div>
      </fieldset>

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

      {serverError && <Notice tone="error">{serverError}</Notice>}
      {Object.keys(errors).length > 0 && (
        <Notice tone="error">Confira os campos destacados acima antes de salvar.</Notice>
      )}
      <p className="text-[11px] text-muted-foreground">
        Em produção, a mudança aparece no site em até 60 segundos.
      </p>

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
            Excluir
          </Button>
        )}
      </div>
    </form>
  );
}
