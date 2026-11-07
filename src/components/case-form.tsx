"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { i18nListPayload, i18nOptionalPayload, i18nPayload, ptText } from "@/lib/i18n";
import { EQUIPAMENTOS, PROBLEMAS, SETORES } from "@/lib/taxonomy";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageField } from "@/components/image-field";
import { OptionSelect, taxonomyOptions } from "@/components/option-select";
import { StructuredEditor } from "@/components/structured/structured-editor";
import { Notice, fieldCls } from "@/components/structured/ui";
import type { Schema } from "@/components/structured/types";

type Obj = Record<string, unknown>;

export type CaseFull = {
  id: string;
  slug: string;
  clienteAnonimo: unknown;
  setorSlug: string;
  equipamentoSlug: string;
  problemaSlug: string;
  ano: string;
  duracao: unknown;
  resumo: unknown;
  heroImageUrl: string | null;
  heroImageAlt?: unknown;
  desafio: unknown;
  diagnostico: unknown;
  solucao: unknown;
  kpis: unknown[];
  depoimento: { quote?: unknown; autor?: string; cargo?: unknown } | null;
  tagsExtras?: string[] | null;
  seoTitle: unknown;
  seoDescription: unknown;
  ogImageUrl: string | null;
  published: boolean;
  displayOrder: number;
};

const schema = z.object({
  slug: z
    .string()
    .min(2, "Informe o endereço do case")
    .regex(/^[a-z0-9-]+$/, "Use só letras minúsculas sem acento, números e hífens"),
  clienteAnonimoText: z.string().min(1, "Cliente obrigatório"),
  setorSlug: z.string().min(1, "Escolha o setor"),
  equipamentoSlug: z.string().min(1, "Escolha o equipamento"),
  problemaSlug: z.string().min(1, "Escolha o problema"),
  ano: z.string().min(4, "Informe o ano (4 dígitos)"),
  duracaoText: z.string().min(1, "Duração obrigatória"),
  resumoText: z.string().min(1, "Resumo obrigatório"),
  heroImageUrl: z.string().optional(),
  heroImageAltText: z.string().optional(),
  desafioText: z.string().min(1, "Desafio obrigatório"),
  diagnosticoText: z.string().min(1, "Diagnóstico obrigatório"),
  solucaoText: z.string().min(1, "Solução obrigatória"),
  depoimentoQuoteText: z.string().optional(),
  depoimentoAutor: z.string().optional(),
  depoimentoCargoText: z.string().optional(),
  tagsExtrasText: z.string().optional(),
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

const kpiSchema: Schema = [
  {
    type: "list",
    key: "kpis",
    label: "Resultados (indicadores antes e depois)",
    help: "Cada linha é um indicador. Ex.: Paradas por ano — antes: 18, depois: 5, variação: -72%.",
    itemLabel: "Indicador",
    addLabel: "Adicionar indicador",
    min: 1,
    title: (it) => ptText((it as Obj)?.label),
    item: {
      fields: [
        { type: "i18n", key: "label", label: "Nome do indicador" },
        { type: "text", key: "before", label: "Antes", placeholder: "ex: 18 por ano" },
        { type: "text", key: "after", label: "Depois", placeholder: "ex: 5 por ano" },
        { type: "text", key: "delta", label: "Variação", placeholder: "ex: -72%" },
        {
          type: "select",
          key: "tone",
          label: "Cor da variação",
          options: [
            { value: "positive", label: "Positiva (verde)" },
            { value: "negative", label: "Negativa (vermelha)" },
            { value: "neutral", label: "Neutra" },
          ],
        },
      ],
    },
    newItem: () => ({
      label: { pt: "", en: null },
      before: "",
      after: "",
      delta: "",
      tone: "positive",
    }),
  },
];

const paras = (v: unknown): string =>
  v && typeof v === "object" && Array.isArray((v as Obj).pt)
    ? ((v as Obj).pt as unknown[]).map(String).join("\n\n")
    : "";

function splitParas(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function CaseForm({ original, mode }: { original?: CaseFull; mode: "create" | "edit" }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [kpiState, setKpiState] = useState<Obj>({ kpis: original?.kpis ?? [] });
  const [initialKpis] = useState(() => JSON.stringify(kpiState));
  const kpiDirty = JSON.stringify(kpiState) !== initialKpis;

  const defaults = useMemo<FormValues>(
    () => ({
      slug: original?.slug ?? "",
      clienteAnonimoText: ptText(original?.clienteAnonimo),
      setorSlug: original?.setorSlug ?? "",
      equipamentoSlug: original?.equipamentoSlug ?? "",
      problemaSlug: original?.problemaSlug ?? "",
      ano: original?.ano ?? new Date().getFullYear().toString(),
      duracaoText: ptText(original?.duracao),
      resumoText: ptText(original?.resumo),
      heroImageUrl: original?.heroImageUrl ?? "",
      heroImageAltText: ptText(original?.heroImageAlt),
      desafioText: paras(original?.desafio),
      diagnosticoText: paras(original?.diagnostico),
      solucaoText: paras(original?.solucao),
      depoimentoQuoteText: ptText(original?.depoimento?.quote),
      depoimentoAutor: original?.depoimento?.autor ?? "",
      depoimentoCargoText: ptText(original?.depoimento?.cargo),
      tagsExtrasText: (original?.tagsExtras ?? []).join(", "),
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

  useUnsavedWarning(isDirty || kpiDirty);

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const o = original;
    const kpis = (kpiState.kpis as Obj[]) ?? [];
    if (kpis.length === 0) {
      setServerError("Adicione pelo menos um indicador de resultado.");
      return;
    }
    const emptyLabel = kpis.findIndex((k) => !ptText(k.label).trim());
    if (emptyLabel >= 0) {
      setServerError(`Indicador ${emptyLabel + 1}: informe o nome do indicador.`);
      return;
    }

    const hasDepo = !!data.depoimentoQuoteText?.trim();
    if (hasDepo && !data.depoimentoCargoText?.trim()) {
      setServerError("Depoimento: informe o cargo ou a empresa de quem falou.");
      return;
    }
    const tags = (data.tagsExtrasText ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      slug: data.slug,
      clienteAnonimo: i18nPayload(o?.clienteAnonimo, data.clienteAnonimoText),
      setorSlug: data.setorSlug,
      equipamentoSlug: data.equipamentoSlug,
      problemaSlug: data.problemaSlug,
      ano: data.ano,
      duracao: i18nPayload(o?.duracao, data.duracaoText),
      resumo: i18nPayload(o?.resumo, data.resumoText),
      heroImageUrl: data.heroImageUrl?.trim() || null,
      heroImageAlt: i18nOptionalPayload(o?.heroImageAlt, data.heroImageAltText ?? ""),
      desafio: i18nListPayload(o?.desafio, splitParas(data.desafioText)),
      diagnostico: i18nListPayload(o?.diagnostico, splitParas(data.diagnosticoText)),
      solucao: i18nListPayload(o?.solucao, splitParas(data.solucaoText)),
      kpis,
      depoimento: hasDepo
        ? {
            quote: i18nPayload(o?.depoimento?.quote, data.depoimentoQuoteText!.trim()),
            autor: data.depoimentoAutor?.trim() || "",
            cargo: i18nPayload(o?.depoimento?.cargo, data.depoimentoCargoText!.trim()),
          }
        : o?.depoimento
          ? null
          : undefined,
      tagsExtras: tags.length > 0 ? tags : o?.tagsExtras ? null : undefined,
      seoTitle: i18nOptionalPayload(o?.seoTitle, data.seoTitleText ?? ""),
      seoDescription: i18nOptionalPayload(o?.seoDescription, data.seoDescriptionText ?? ""),
      ogImageUrl: data.ogImageUrl?.trim() || null,
      published: data.published,
      displayOrder: data.displayOrder,
    };

    try {
      if (mode === "create") {
        await api.post("/cms/admin/cases", payload);
      } else if (o) {
        await api.put(`/cms/admin/cases/${o.id}`, payload);
      }
      router.push("/dashboard/cases");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? `Não foi possível salvar: ${err.message}` : "Erro inesperado ao salvar.",
      );
    }
  }

  async function onDelete() {
    if (!original) return;
    if (!confirm("Excluir este case? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/cms/admin/cases/${original.id}`);
      router.push("/dashboard/cases");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erro inesperado");
    }
  }

  const setor = watch("setorSlug");
  const equip = watch("equipamentoSlug");
  const problema = watch("problemaSlug");
  const hero = watch("heroImageUrl") ?? "";
  const og = watch("ogImageUrl") ?? "";
  const dirtySet = { shouldDirty: true } as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
      <div className="space-y-1">
        <Label htmlFor="slug">Endereço do case (slug)</Label>
        <Input id="slug" {...register("slug")} placeholder="ex: mineracao-britador-mancal" />
        <p className="text-[11px] text-muted-foreground">
          Parte final do link do case (/cases/<b>endereço</b>). Letras minúsculas sem acento,
          números e hífens.
        </p>
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="clienteAnonimoText">Cliente (sem citar o nome)</Label>
          <Input id="clienteAnonimoText" {...register("clienteAnonimoText")} placeholder="ex: Planta de Celulose · Sul" />
          {errors.clienteAnonimoText && (
            <p className="text-xs text-destructive">{errors.clienteAnonimoText.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="ano">Ano</Label>
          <Input id="ano" {...register("ano")} placeholder="2024" />
          {errors.ano && <p className="text-xs text-destructive">{errors.ano.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="setorSlug">Setor</Label>
          <OptionSelect
            id="setorSlug"
            value={setor}
            onChange={(v) => setValue("setorSlug", v, dirtySet)}
            options={taxonomyOptions(SETORES)}
          />
          {errors.setorSlug && <p className="text-xs text-destructive">{errors.setorSlug.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="equipamentoSlug">Equipamento</Label>
          <OptionSelect
            id="equipamentoSlug"
            value={equip}
            onChange={(v) => setValue("equipamentoSlug", v, dirtySet)}
            options={taxonomyOptions(EQUIPAMENTOS)}
          />
          {errors.equipamentoSlug && (
            <p className="text-xs text-destructive">{errors.equipamentoSlug.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="problemaSlug">Problema</Label>
          <OptionSelect
            id="problemaSlug"
            value={problema}
            onChange={(v) => setValue("problemaSlug", v, dirtySet)}
            options={taxonomyOptions(PROBLEMAS)}
          />
          {errors.problemaSlug && (
            <p className="text-xs text-destructive">{errors.problemaSlug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="duracaoText">Duração do projeto</Label>
        <Input id="duracaoText" {...register("duracaoText")} placeholder="ex: 9 meses" />
        {errors.duracaoText && <p className="text-xs text-destructive">{errors.duracaoText.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="heroImageUrl">Imagem de capa</Label>
        <ImageField id="heroImageUrl" value={hero} onChange={(v) => setValue("heroImageUrl", v, dirtySet)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="heroImageAltText">Descrição da imagem de capa (para leitores de tela)</Label>
        <Input id="heroImageAltText" {...register("heroImageAltText")} placeholder="Se vazio, o site usa o nome do cliente" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="resumoText">Resumo (1 parágrafo)</Label>
        <textarea id="resumoText" rows={3} {...register("resumoText")} className={fieldCls} />
        {errors.resumoText && <p className="text-xs text-destructive">{errors.resumoText.message}</p>}
      </div>

      {(
        [
          ["desafioText", "Desafio", errors.desafioText?.message],
          ["diagnosticoText", "Diagnóstico", errors.diagnosticoText?.message],
          ["solucaoText", "Solução", errors.solucaoText?.message],
        ] as const
      ).map(([name, label, err]) => (
        <div key={name} className="space-y-1">
          <Label htmlFor={name}>{label} — separe os parágrafos com uma linha em branco</Label>
          <textarea id={name} rows={5} {...register(name)} className={fieldCls} />
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      ))}

      <StructuredEditor schema={kpiSchema} value={kpiState} onChange={setKpiState} />

      <fieldset className="space-y-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Depoimento (opcional)</legend>
        <div className="space-y-1">
          <Label htmlFor="depoimentoQuoteText">Frase do cliente</Label>
          <textarea id="depoimentoQuoteText" rows={3} {...register("depoimentoQuoteText")} className={fieldCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="depoimentoAutor">Nome ou função de quem falou</Label>
            <Input id="depoimentoAutor" {...register("depoimentoAutor")} placeholder="ex: Gerente de Confiabilidade" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="depoimentoCargoText">Cargo / empresa</Label>
            <Input id="depoimentoCargoText" {...register("depoimentoCargoText")} placeholder="ex: Cliente · Planta de Celulose" />
          </div>
        </div>
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="tagsExtrasText">Etiquetas extras (separadas por vírgula, opcional)</Label>
        <Input id="tagsExtrasText" {...register("tagsExtrasText")} placeholder="ex: ISO 4406, relubrificação" />
      </div>

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
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar case" : "Salvar alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/cases")}>
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
