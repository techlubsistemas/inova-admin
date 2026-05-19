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

const i18nString = z.object({
  pt: z.string().min(1, "PT obrigatório"),
  en: z.string().nullable().optional(),
});

const CATEGORIAS = [
  { value: "medicao", label: "Medição" },
  { value: "tecnica", label: "Técnica" },
  { value: "certificacao", label: "Certificação" },
  { value: "equipamento", label: "Equipamento" },
  { value: "norma", label: "Norma" },
] as const;

export const glossaryFormSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  termo: i18nString,
  sigla: z.string().nullable().optional(),
  categoriaSlug: z.enum(["medicao", "tecnica", "certificacao", "equipamento", "norma"]),
  definicaoCurta: i18nString,
  definicaoLongaText: z.string().min(1, "Pelo menos 1 parágrafo"),
  termosRelacionadosText: z.string().optional(),
  published: z.boolean().default(true),
});

export type GlossaryFormData = z.infer<typeof glossaryFormSchema>;

export function GlossaryForm({
  defaultValues,
  id,
  mode,
}: {
  defaultValues?: Partial<GlossaryFormData>;
  id?: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GlossaryFormData>({
    resolver: zodResolver(glossaryFormSchema),
    defaultValues: {
      slug: "",
      termo: { pt: "", en: null },
      sigla: "",
      categoriaSlug: "tecnica",
      definicaoCurta: { pt: "", en: null },
      definicaoLongaText: "",
      termosRelacionadosText: "",
      published: true,
      ...defaultValues,
    },
  });

  async function onSubmit(data: GlossaryFormData) {
    setServerError(null);
    const payload = {
      slug: data.slug,
      termo: { pt: data.termo.pt, en: data.termo.en || null },
      sigla: data.sigla?.trim() || null,
      categoriaSlug: data.categoriaSlug,
      definicaoCurta: {
        pt: data.definicaoCurta.pt,
        en: data.definicaoCurta.en || null,
      },
      definicaoLonga: {
        pt: data.definicaoLongaText
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        en: null,
      },
      termosRelacionados:
        data.termosRelacionadosText
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) ?? null,
      published: data.published,
    };
    try {
      if (mode === "create") {
        await api.post("/cms/admin/glossary", payload);
      } else if (id) {
        await api.put(`/cms/admin/glossary/${id}`, payload);
      }
      router.push("/dashboard/glossario");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Deletar este termo? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/cms/admin/glossary/${id}`);
      router.push("/dashboard/glossario");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div className="space-y-1">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" {...register("slug")} placeholder="ex: iso-4406" />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="termo.pt">Termo (PT)</Label>
          <Input id="termo.pt" {...register("termo.pt")} />
          {errors.termo?.pt && (
            <p className="text-xs text-destructive">{errors.termo.pt.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="termo.en">Termo (EN)</Label>
          <Input id="termo.en" {...register("termo.en")} placeholder="opcional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="sigla">Sigla</Label>
          <Input id="sigla" {...register("sigla")} placeholder="opcional" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="categoriaSlug">Categoria</Label>
          <select
            id="categoriaSlug"
            {...register("categoriaSlug")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="definicaoCurta.pt">Definição curta (PT)</Label>
        <textarea
          id="definicaoCurta.pt"
          rows={3}
          {...register("definicaoCurta.pt")}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.definicaoCurta?.pt && (
          <p className="text-xs text-destructive">
            {errors.definicaoCurta.pt.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="definicaoLongaText">
          Definição longa (PT) — separe parágrafos com linha em branco
        </Label>
        <textarea
          id="definicaoLongaText"
          rows={8}
          {...register("definicaoLongaText")}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.definicaoLongaText && (
          <p className="text-xs text-destructive">
            {errors.definicaoLongaText.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="termosRelacionadosText">
          Termos relacionados (slugs separados por vírgula)
        </Label>
        <Input
          id="termosRelacionadosText"
          {...register("termosRelacionadosText")}
          placeholder="ex: mtbf, fmea, rcm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          type="checkbox"
          {...register("published")}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="published" className="cursor-pointer">
          Publicado no site
        </Label>
      </div>

      {serverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar termo" : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/glossario")}
          >
            Cancelar
          </Button>
        </div>

        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Deletar
          </Button>
        )}
      </div>
    </form>
  );
}
