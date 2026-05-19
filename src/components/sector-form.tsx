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

const schema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  nomePt: z.string().min(1, "Nome obrigatório"),
  taglinePt: z.string().min(1, "Tagline obrigatória"),
  descricaoPt: z.string().min(1, "Descrição obrigatória"),
  heroImageUrl: z.string().optional(),
  equipamentosJson: z.string().min(2, "JSON obrigatório"),
  problemasJson: z.string().min(2, "JSON obrigatório"),
  regulamentacaoJson: z.string().min(2, "JSON obrigatório"),
  faqsJson: z.string().optional(),
  seoTitleText: z.string().optional(),
  seoDescriptionText: z.string().optional(),
  ogImageUrl: z.string().optional(),
  published: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

type FormData = z.infer<typeof schema>;

const EQUIP_EXAMPLE = JSON.stringify(
  [{ nome: { pt: "Britadores", en: null }, criticidade: { pt: "Crítica (A)", en: null }, lubrificacao: { pt: "Graxa EP", en: null } }],
  null,
  2,
);

const PROB_EXAMPLE = JSON.stringify(
  [{ titulo: { pt: "Contaminação", en: null }, descricao: { pt: "Descreva aqui.", en: null } }],
  null,
  2,
);

const REG_EXAMPLE = JSON.stringify(
  [{ norma: "NR-22", descricao: { pt: "Norma de segurança.", en: null } }],
  null,
  2,
);

export function SectorForm({
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
      nomePt: "",
      taglinePt: "",
      descricaoPt: "",
      heroImageUrl: "",
      equipamentosJson: EQUIP_EXAMPLE,
      problemasJson: PROB_EXAMPLE,
      regulamentacaoJson: REG_EXAMPLE,
      faqsJson: "[]",
      seoTitleText: "",
      seoDescriptionText: "",
      ogImageUrl: "",
      published: true,
      displayOrder: 0,
      ...defaultValues,
    },
  });

  function parseJson(raw: string | undefined, label: string): unknown[] | null {
    if (!raw?.trim()) return [];
    try {
      const v = JSON.parse(raw);
      if (!Array.isArray(v)) throw new Error(`${label} deve ser array`);
      return v;
    } catch {
      return null;
    }
  }

  async function onSubmit(data: FormData) {
    setServerError(null);

    const equipamentos = parseJson(data.equipamentosJson, "Equipamentos");
    const problemas = parseJson(data.problemasJson, "Problemas");
    const regulamentacao = parseJson(data.regulamentacaoJson, "Regulamentação");
    const faqs = parseJson(data.faqsJson, "FAQs");

    if (!equipamentos) { setServerError("Equipamentos: JSON inválido."); return; }
    if (!problemas) { setServerError("Problemas: JSON inválido."); return; }
    if (!regulamentacao) { setServerError("Regulamentação: JSON inválido."); return; }
    if (faqs === null) { setServerError("FAQs: JSON inválido."); return; }

    const payload = {
      slug: data.slug,
      nome: { pt: data.nomePt, en: null },
      tagline: { pt: data.taglinePt, en: null },
      descricao: { pt: data.descricaoPt, en: null },
      heroImageUrl: data.heroImageUrl?.trim() || null,
      equipamentosTipicos: equipamentos,
      problemasComuns: problemas,
      regulamentacao,
      faqs: faqs.length > 0 ? faqs : null,
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
        await api.post("/cms/admin/sectors", payload);
      } else if (id) {
        await api.put(`/cms/admin/sectors/${id}`, payload);
      }
      router.push("/dashboard/setores");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Deletar este setor? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/cms/admin/sectors/${id}`);
      router.push("/dashboard/setores");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  const fieldCls = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">

      {/* Identificação */}
      <div className="space-y-1">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" {...register("slug")} placeholder="ex: mineracao" />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="nomePt">Nome do setor</Label>
          <Input id="nomePt" {...register("nomePt")} placeholder="ex: Mineração" />
          {errors.nomePt && <p className="text-xs text-destructive">{errors.nomePt.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="heroImageUrl">Hero image URL</Label>
          <Input id="heroImageUrl" {...register("heroImageUrl")} placeholder="/01.png" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="taglinePt">Tagline</Label>
        <Input id="taglinePt" {...register("taglinePt")} placeholder="ex: Onde a graxa errada custa R$ 380 mil…" />
        {errors.taglinePt && <p className="text-xs text-destructive">{errors.taglinePt.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="descricaoPt">Descrição</Label>
        <textarea id="descricaoPt" rows={4} {...register("descricaoPt")} className={fieldCls} />
        {errors.descricaoPt && <p className="text-xs text-destructive">{errors.descricaoPt.message}</p>}
      </div>

      {/* JSON arrays */}
      <div className="space-y-1">
        <Label htmlFor="equipamentosJson">
          Equipamentos típicos (JSON){" "}
          <code className="rounded bg-muted px-1 text-[10px]">{"[{nome:{pt}, criticidade:{pt}, lubrificacao:{pt}}]"}</code>
        </Label>
        <textarea id="equipamentosJson" rows={8} {...register("equipamentosJson")} className={`${fieldCls} font-mono text-xs`} />
        {errors.equipamentosJson && <p className="text-xs text-destructive">{errors.equipamentosJson.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="problemasJson">
          Problemas comuns (JSON){" "}
          <code className="rounded bg-muted px-1 text-[10px]">{"[{titulo:{pt}, descricao:{pt}}]"}</code>
        </Label>
        <textarea id="problemasJson" rows={8} {...register("problemasJson")} className={`${fieldCls} font-mono text-xs`} />
        {errors.problemasJson && <p className="text-xs text-destructive">{errors.problemasJson.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="regulamentacaoJson">
          Regulamentação (JSON){" "}
          <code className="rounded bg-muted px-1 text-[10px]">{"[{norma:string, descricao:{pt}}]"}</code>
        </Label>
        <textarea id="regulamentacaoJson" rows={6} {...register("regulamentacaoJson")} className={`${fieldCls} font-mono text-xs`} />
        {errors.regulamentacaoJson && <p className="text-xs text-destructive">{errors.regulamentacaoJson.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="faqsJson">
          FAQs (JSON, opcional){" "}
          <code className="rounded bg-muted px-1 text-[10px]">{"[{pergunta:{pt}, resposta:{pt}}]"}</code>
        </Label>
        <textarea id="faqsJson" rows={6} {...register("faqsJson")} className={`${fieldCls} font-mono text-xs`} />
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

      {/* Config */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="displayOrder">Ordem de exibição</Label>
          <Input id="displayOrder" type="number" {...register("displayOrder", { valueAsNumber: true })} />
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
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar setor" : "Salvar alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/setores")}>
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
