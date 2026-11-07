"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { i18nOptionalPayload, i18nPayload, ptText } from "@/lib/i18n";
import { SETORES } from "@/lib/taxonomy";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageField } from "@/components/image-field";
import { StructuredEditor } from "@/components/structured/structured-editor";
import { Notice, fieldCls } from "@/components/structured/ui";
import type { Schema } from "@/components/structured/types";

type Obj = Record<string, unknown>;

export type SectorFull = {
  id: string;
  slug: string;
  nome: unknown;
  tagline: unknown;
  descricao: unknown;
  heroImageUrl: string | null;
  equipamentosTipicos: unknown[];
  problemasComuns: unknown[];
  regulamentacao: unknown[];
  faqs: unknown[] | null;
  seoTitle: unknown;
  seoDescription: unknown;
  ogImageUrl: string | null;
  published: boolean;
  displayOrder: number;
};

const schema = z.object({
  slug: z
    .string()
    .min(2, "Informe o endereço do setor")
    .regex(/^[a-z0-9-]+$/, "Use só letras minúsculas sem acento, números e hífens"),
  nomePt: z.string().min(1, "Nome obrigatório"),
  taglinePt: z.string().min(1, "Frase de destaque obrigatória"),
  descricaoPt: z.string().min(1, "Descrição obrigatória"),
  heroImageUrl: z.string().optional(),
  seoTitleText: z.string().optional(),
  seoDescriptionText: z.string().optional(),
  ogImageUrl: z.string().optional(),
  published: z.boolean().default(true),
  displayOrder: z
    .number({ invalid_type_error: "Informe um número" })
    .int("Use um número inteiro")
    .default(0),
});

type FormValues = z.infer<typeof schema>;

const emptyI18n = () => ({ pt: "", en: null });

const listsSchema: Schema = [
  {
    type: "list",
    key: "equipamentosTipicos",
    label: "Equipamentos típicos",
    help: "Máquinas comuns neste setor e como costumam ser lubrificadas.",
    itemLabel: "Equipamento",
    addLabel: "Adicionar equipamento",
    title: (it) => ptText((it as Obj)?.nome),
    item: {
      fields: [
        { type: "i18n", key: "nome", label: "Nome do equipamento" },
        { type: "i18n", key: "criticidade", label: "Criticidade", placeholder: "ex: Crítica (A)" },
        { type: "i18n", key: "lubrificacao", label: "Lubrificação indicada" },
      ],
    },
    newItem: () => ({ nome: emptyI18n(), criticidade: emptyI18n(), lubrificacao: emptyI18n() }),
  },
  {
    type: "list",
    key: "problemasComuns",
    label: "Problemas comuns",
    itemLabel: "Problema",
    addLabel: "Adicionar problema",
    title: (it) => ptText((it as Obj)?.titulo),
    item: {
      fields: [
        { type: "i18n", key: "titulo", label: "Título do problema" },
        { type: "i18n", key: "descricao", label: "Descrição", multiline: true },
      ],
    },
    newItem: () => ({ titulo: emptyI18n(), descricao: emptyI18n() }),
  },
  {
    type: "list",
    key: "regulamentacao",
    label: "Normas e regulamentação",
    itemLabel: "Norma",
    addLabel: "Adicionar norma",
    title: (it) => String((it as Obj)?.norma ?? ""),
    item: {
      fields: [
        { type: "text", key: "norma", label: "Nome da norma", placeholder: "ex: NR-22" },
        { type: "i18n", key: "descricao", label: "O que a norma pede", multiline: true },
      ],
    },
    newItem: () => ({ norma: "", descricao: emptyI18n() }),
  },
  {
    type: "list",
    key: "faqs",
    label: "Perguntas frequentes (opcional)",
    itemLabel: "Pergunta",
    addLabel: "Adicionar pergunta",
    title: (it) => ptText((it as Obj)?.pergunta),
    item: {
      fields: [
        { type: "i18n", key: "pergunta", label: "Pergunta" },
        { type: "i18n", key: "resposta", label: "Resposta", multiline: true },
      ],
    },
    newItem: () => ({ pergunta: emptyI18n(), resposta: emptyI18n() }),
  },
];

function listsOf(o?: SectorFull): Obj {
  return {
    equipamentosTipicos: o?.equipamentosTipicos ?? [],
    problemasComuns: o?.problemasComuns ?? [],
    regulamentacao: o?.regulamentacao ?? [],
    faqs: o?.faqs ?? [],
  };
}

export function SectorForm({ original, mode }: { original?: SectorFull; mode: "create" | "edit" }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [lists, setLists] = useState<Obj>(() => listsOf(original));
  const [initialLists] = useState(() => JSON.stringify(lists));
  const listsDirty = JSON.stringify(lists) !== initialLists;

  const defaults = useMemo<FormValues>(
    () => ({
      slug: original?.slug ?? "",
      nomePt: ptText(original?.nome),
      taglinePt: ptText(original?.tagline),
      descricaoPt: ptText(original?.descricao),
      heroImageUrl: original?.heroImageUrl ?? "",
      seoTitleText: ptText(original?.seoTitle),
      seoDescriptionText: ptText(original?.seoDescription),
      ogImageUrl: original?.ogImageUrl ?? "",
      published: original?.published ?? true,
      displayOrder: original?.displayOrder ?? 0,
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

  useUnsavedWarning(isDirty || listsDirty);

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const o = original;
    const faqs = (lists.faqs as unknown[]) ?? [];
    const payload = {
      slug: data.slug,
      nome: i18nPayload(o?.nome, data.nomePt),
      tagline: i18nPayload(o?.tagline, data.taglinePt),
      descricao: i18nPayload(o?.descricao, data.descricaoPt),
      heroImageUrl: data.heroImageUrl?.trim() || null,
      equipamentosTipicos: lists.equipamentosTipicos,
      problemasComuns: lists.problemasComuns,
      regulamentacao: lists.regulamentacao,
      faqs: faqs.length > 0 ? faqs : o?.faqs ? null : undefined,
      seoTitle: i18nOptionalPayload(o?.seoTitle, data.seoTitleText ?? ""),
      seoDescription: i18nOptionalPayload(o?.seoDescription, data.seoDescriptionText ?? ""),
      ogImageUrl: data.ogImageUrl?.trim() || null,
      published: data.published,
      displayOrder: data.displayOrder,
    };
    try {
      if (mode === "create") {
        await api.post("/cms/admin/sectors", payload);
      } else if (o) {
        await api.put(`/cms/admin/sectors/${o.id}`, payload);
      }
      router.push("/dashboard/setores");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? `Não foi possível salvar: ${err.message}` : "Erro inesperado ao salvar.",
      );
    }
  }

  async function onDelete() {
    if (!original) return;
    if (!confirm("Excluir este setor? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/cms/admin/sectors/${original.id}`);
      router.push("/dashboard/setores");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  const slug = watch("slug");
  const hero = watch("heroImageUrl") ?? "";
  const og = watch("ogImageUrl") ?? "";
  const dirtySet = { shouldDirty: true } as const;
  const slugOutside = slug !== "" && !(slug in SETORES);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
      <div className="space-y-1">
        <Label htmlFor="slug">Endereço do setor (slug)</Label>
        <Input id="slug" list="setores-site" {...register("slug")} placeholder="ex: mineracao" />
        <datalist id="setores-site">
          {Object.entries(SETORES).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </datalist>
        <p className="text-[11px] text-muted-foreground">
          Parte final do link da página (/industrias/<b>endereço</b>). Os cases se ligam ao setor
          por este endereço.
        </p>
        {slugOutside && (
          <p className="rounded border border-yellow-300 bg-yellow-50 px-2 py-1 text-[11px] text-yellow-900">
            Este endereço não está na lista de setores que o site conhece (
            {Object.keys(SETORES).join(", ")}). O valor foi mantido como está.
          </p>
        )}
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="nomePt">Nome do setor</Label>
        <Input id="nomePt" {...register("nomePt")} placeholder="ex: Mineração" />
        {errors.nomePt && <p className="text-xs text-destructive">{errors.nomePt.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="taglinePt">Frase de destaque</Label>
        <Input id="taglinePt" {...register("taglinePt")} placeholder="ex: Onde a graxa errada custa R$ 380 mil…" />
        {errors.taglinePt && <p className="text-xs text-destructive">{errors.taglinePt.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="descricaoPt">Descrição</Label>
        <textarea id="descricaoPt" rows={4} {...register("descricaoPt")} className={fieldCls} />
        {errors.descricaoPt && <p className="text-xs text-destructive">{errors.descricaoPt.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="heroImageUrl">Imagem de capa</Label>
        <ImageField id="heroImageUrl" value={hero} onChange={(v) => setValue("heroImageUrl", v, dirtySet)} />
      </div>

      <StructuredEditor schema={listsSchema} value={lists} onChange={setLists} />

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
          <ImageField id="ogImageUrl" value={og} onChange={(v) => setValue("ogImageUrl", v, dirtySet)} />
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="displayOrder">Ordem de exibição</Label>
          <Input id="displayOrder" type="number" {...register("displayOrder", { valueAsNumber: true })} />
          <p className="text-[11px] text-muted-foreground">Números menores aparecem primeiro.</p>
          {errors.displayOrder && <p className="text-xs text-destructive">{errors.displayOrder.message}</p>}
        </div>
        <div className="flex items-center gap-2 pt-6">
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
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar setor" : "Salvar alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/setores")}>
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
