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

const i18n = z.object({
  pt: z.string().min(1, "PT obrigatório"),
  en: z.string().nullable().optional(),
});

const schema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  clienteAnonimoText: z.string().min(1, "Cliente obrigatório"),
  setorSlug: z.string().min(1, "Setor obrigatório"),
  equipamentoSlug: z.string().min(1, "Equipamento obrigatório"),
  problemaSlug: z.string().min(1, "Problema obrigatório"),
  ano: z.string().min(4, "Ano obrigatório"),
  duracaoText: z.string().min(1, "Duração obrigatória"),
  resumoText: z.string().min(1, "Resumo obrigatório"),
  heroImageUrl: z.string().optional(),
  desafioText: z.string().min(1, "Desafio obrigatório"),
  diagnosticoText: z.string().min(1, "Diagnóstico obrigatório"),
  solucaoText: z.string().min(1, "Solução obrigatória"),
  kpisJson: z.string().min(2, "KPIs obrigatórios (JSON)"),
  depoimentoQuoteText: z.string().optional(),
  depoimentoAutor: z.string().optional(),
  depoimentoCargoText: z.string().optional(),
  seoTitleText: z.string().optional(),
  seoDescriptionText: z.string().optional(),
  ogImageUrl: z.string().optional(),
  published: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

type FormData = z.infer<typeof schema>;

function splitParas(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function CaseForm({
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
      clienteAnonimoText: "",
      setorSlug: "",
      equipamentoSlug: "",
      problemaSlug: "",
      ano: new Date().getFullYear().toString(),
      duracaoText: "",
      resumoText: "",
      heroImageUrl: "",
      desafioText: "",
      diagnosticoText: "",
      solucaoText: "",
      kpisJson: JSON.stringify(
        [{ label: { pt: "", en: null }, before: "", after: "", delta: "", tone: "positive" }],
        null,
        2,
      ),
      depoimentoQuoteText: "",
      depoimentoAutor: "",
      depoimentoCargoText: "",
      seoTitleText: "",
      seoDescriptionText: "",
      ogImageUrl: "",
      published: true,
      displayOrder: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    let kpis: unknown[];
    try {
      kpis = JSON.parse(data.kpisJson);
      if (!Array.isArray(kpis)) throw new Error("KPIs deve ser um array JSON");
    } catch {
      setServerError("KPIs: JSON inválido. Corrija o formato.");
      return;
    }

    const hasDepo = data.depoimentoQuoteText?.trim();
    const payload = {
      slug: data.slug,
      clienteAnonimo: { pt: data.clienteAnonimoText, en: null },
      setorSlug: data.setorSlug,
      equipamentoSlug: data.equipamentoSlug,
      problemaSlug: data.problemaSlug,
      ano: data.ano,
      duracao: { pt: data.duracaoText, en: null },
      resumo: { pt: data.resumoText, en: null },
      heroImageUrl: data.heroImageUrl?.trim() || null,
      desafio: { pt: splitParas(data.desafioText), en: null },
      diagnostico: { pt: splitParas(data.diagnosticoText), en: null },
      solucao: { pt: splitParas(data.solucaoText), en: null },
      kpis,
      depoimento: hasDepo
        ? {
            quote: { pt: data.depoimentoQuoteText!.trim(), en: null },
            autor: data.depoimentoAutor?.trim() || "",
            cargo: { pt: data.depoimentoCargoText?.trim() || "", en: null },
          }
        : null,
      seoTitle: data.seoTitleText?.trim()
        ? { pt: data.seoTitleText.trim(), en: null }
        : null,
      seoDescription: data.seoDescriptionText?.trim()
        ? { pt: data.seoDescriptionText.trim(), en: null }
        : null,
      ogImageUrl: data.ogImageUrl?.trim() || null,
      published: data.published,
      displayOrder: data.displayOrder,
    };

    try {
      if (mode === "create") {
        await api.post("/cms/admin/cases", payload);
      } else if (id) {
        await api.put(`/cms/admin/cases/${id}`, payload);
      }
      router.push("/dashboard/cases");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Deletar este case? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/cms/admin/cases/${id}`);
      router.push("/dashboard/cases");
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
        <Input id="slug" {...register("slug")} placeholder="ex: mineracao-britador-mancal" />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      {/* Identificação */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="clienteAnonimoText">Cliente (anônimo)</Label>
          <Input id="clienteAnonimoText" {...register("clienteAnonimoText")} placeholder="ex: Planta de Celulose · Sul" />
          {errors.clienteAnonimoText && <p className="text-xs text-destructive">{errors.clienteAnonimoText.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="ano">Ano</Label>
          <Input id="ano" {...register("ano")} placeholder="2024" />
          {errors.ano && <p className="text-xs text-destructive">{errors.ano.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="setorSlug">Setor (slug)</Label>
          <Input id="setorSlug" {...register("setorSlug")} placeholder="ex: mineracao" />
          {errors.setorSlug && <p className="text-xs text-destructive">{errors.setorSlug.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="equipamentoSlug">Equipamento (slug)</Label>
          <Input id="equipamentoSlug" {...register("equipamentoSlug")} placeholder="ex: britador" />
          {errors.equipamentoSlug && <p className="text-xs text-destructive">{errors.equipamentoSlug.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="problemaSlug">Problema (slug)</Label>
          <Input id="problemaSlug" {...register("problemaSlug")} placeholder="ex: desgaste" />
          {errors.problemaSlug && <p className="text-xs text-destructive">{errors.problemaSlug.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="duracaoText">Duração</Label>
          <Input id="duracaoText" {...register("duracaoText")} placeholder="ex: 9 meses" />
          {errors.duracaoText && <p className="text-xs text-destructive">{errors.duracaoText.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="heroImageUrl">URL da imagem hero</Label>
          <Input id="heroImageUrl" {...register("heroImageUrl")} placeholder="ex: /01.png" />
        </div>
      </div>

      {/* Resumo */}
      <div className="space-y-1">
        <Label htmlFor="resumoText">Resumo (1 parágrafo)</Label>
        <textarea id="resumoText" rows={3} {...register("resumoText")} className={fieldCls} />
        {errors.resumoText && <p className="text-xs text-destructive">{errors.resumoText.message}</p>}
      </div>

      {/* Conteúdo */}
      <div className="space-y-1">
        <Label htmlFor="desafioText">Desafio — separe parágrafos com linha em branco</Label>
        <textarea id="desafioText" rows={5} {...register("desafioText")} className={fieldCls} />
        {errors.desafioText && <p className="text-xs text-destructive">{errors.desafioText.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="diagnosticoText">Diagnóstico — separe parágrafos com linha em branco</Label>
        <textarea id="diagnosticoText" rows={5} {...register("diagnosticoText")} className={fieldCls} />
        {errors.diagnosticoText && <p className="text-xs text-destructive">{errors.diagnosticoText.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="solucaoText">Solução — separe parágrafos com linha em branco</Label>
        <textarea id="solucaoText" rows={5} {...register("solucaoText")} className={fieldCls} />
        {errors.solucaoText && <p className="text-xs text-destructive">{errors.solucaoText.message}</p>}
      </div>

      {/* KPIs */}
      <div className="space-y-1">
        <Label htmlFor="kpisJson">
          KPIs (JSON) — array de{" "}
          <code className="rounded bg-muted px-1 text-[10px]">
            {"{ label:{pt,en}, before, after, delta, tone }"}
          </code>
        </Label>
        <textarea id="kpisJson" rows={8} {...register("kpisJson")} className={`${fieldCls} font-mono text-xs`} />
        {errors.kpisJson && <p className="text-xs text-destructive">{errors.kpisJson.message}</p>}
      </div>

      {/* Depoimento (opcional) */}
      <fieldset className="space-y-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Depoimento (opcional)</legend>
        <div className="space-y-1">
          <Label htmlFor="depoimentoQuoteText">Citação</Label>
          <textarea id="depoimentoQuoteText" rows={3} {...register("depoimentoQuoteText")} className={fieldCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="depoimentoAutor">Autor</Label>
            <Input id="depoimentoAutor" {...register("depoimentoAutor")} placeholder="ex: Gerente de Confiabilidade" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="depoimentoCargoText">Cargo / empresa</Label>
            <Input id="depoimentoCargoText" {...register("depoimentoCargoText")} placeholder="ex: Cliente · Planta de Celulose" />
          </div>
        </div>
      </fieldset>

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

      {/* Config */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="displayOrder">Ordem de exibição</Label>
          <Input
            id="displayOrder"
            type="number"
            {...register("displayOrder", { valueAsNumber: true })}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
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
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar case" : "Salvar alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/cases")}>
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
