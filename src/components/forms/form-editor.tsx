"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { i18nOptionalPayload, i18nPayload, ptText } from "@/lib/i18n";
import { publicFormUrl } from "@/lib/site";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { selectCls } from "@/components/option-select";
import { ItemShell, Notice, fieldCls, moveItem } from "@/components/structured/ui";

type Obj = Record<string, unknown>;

export type FormFull = {
  id: string;
  slug: string;
  name: string;
  title: unknown;
  description: unknown;
  fields: unknown;
  submitLabel: unknown;
  successMessage: unknown;
  published: boolean;
  submissionsCount?: number;
};

const FIELD_TYPES = [
  { value: "text", label: "Texto curto" },
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
  { value: "textarea", label: "Texto longo" },
  { value: "select", label: "Lista de opções" },
  { value: "checkbox", label: "Caixa de marcar (sim/não)" },
];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FIELD_ID_RE = /^[A-Za-z][A-Za-z0-9_]{0,59}$/;

type OptState = { value: string; label: string };
type FieldState = {
  key: number;
  id: string;
  idTouched: boolean;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: OptState[];
  /** Campo original vindo da API (para preservar `en` e chaves desconhecidas). */
  orig: Obj | null;
};

type State = {
  name: string;
  slug: string;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  published: boolean;
  fields: FieldState[];
};

let keySeq = 1;

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function fieldIdFrom(label: string, taken: Set<string>) {
  const words = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/-/g, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  let base = words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
  if (!base || !/^[A-Za-z]/.test(base)) base = `campo${base}`;
  base = base.slice(0, 55);
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}${n++}`;
  return id;
}

function toState(f: FormFull | null): State {
  const raw = Array.isArray(f?.fields) ? (f!.fields as unknown[]) : [];
  return {
    name: f?.name ?? "",
    slug: f?.slug ?? "",
    title: ptText(f?.title),
    description: ptText(f?.description),
    submitLabel: f ? ptText(f.submitLabel) : "Enviar",
    successMessage: f ? ptText(f.successMessage) : "Recebemos seu envio. Obrigado!",
    published: f?.published ?? false,
    fields: raw.filter(isObj).map((o) => ({
      key: keySeq++,
      id: String(o.id ?? ""),
      idTouched: true,
      type: String(o.type ?? "text"),
      label: ptText(o.label),
      placeholder: ptText(o.placeholder),
      required: o.required === true,
      options: Array.isArray(o.options)
        ? (o.options as unknown[]).filter(isObj).map((op) => ({
            value: String(op.value ?? ""),
            label: ptText(op.label),
          }))
        : [],
      orig: o,
    })),
  };
}

function validate(s: State): string[] {
  const errs: string[] = [];
  if (!s.name.trim()) errs.push("Informe o nome interno do formulário.");
  if (!s.slug) errs.push("Informe o endereço (slug) do formulário.");
  else if (!SLUG_RE.test(s.slug))
    errs.push("O endereço deve ter só letras minúsculas, números e hífens (ex.: contato-comercial).");
  if (!s.title.trim()) errs.push("Informe o título do formulário.");
  if (!s.submitLabel.trim()) errs.push("Informe o texto do botão de enviar.");
  if (!s.successMessage.trim()) errs.push("Informe a mensagem exibida depois do envio.");
  if (s.fields.length === 0) errs.push("Adicione ao menos um campo.");
  const seen = new Set<string>();
  s.fields.forEach((f, i) => {
    const n = `Campo ${i + 1}`;
    if (!f.label.trim()) errs.push(`${n}: informe o rótulo.`);
    if (!FIELD_ID_RE.test(f.id))
      errs.push(`${n}: o identificador deve começar com letra e ter só letras, números e _ (até 60).`);
    if (seen.has(f.id)) errs.push(`${n}: o identificador "${f.id}" está repetido.`);
    seen.add(f.id);
    if (f.type === "select") {
      if (f.options.length === 0) errs.push(`${n}: adicione ao menos uma opção.`);
      const vals = new Set<string>();
      f.options.forEach((o, j) => {
        if (!o.value.trim() || !o.label.trim())
          errs.push(`${n}, opção ${j + 1}: preencha o valor e o texto.`);
        if (vals.has(o.value)) errs.push(`${n}, opção ${j + 1}: o valor "${o.value}" está repetido.`);
        vals.add(o.value);
      });
    }
  });
  return errs;
}

function toPayload(s: State, orig: FormFull | null) {
  const fields = s.fields.map((f) => {
    const o = f.orig;
    const out: Obj = {
      id: f.id,
      type: f.type,
      label: i18nPayload(o?.label, f.label.trim()),
      required: f.required,
    };
    const ph = i18nOptionalPayload(o?.placeholder, f.placeholder);
    if (ph) out.placeholder = ph;
    if (f.type === "select") {
      const origOpts = Array.isArray(o?.options) ? (o!.options as unknown[]).filter(isObj) : [];
      out.options = f.options.map((op) => {
        const prev = origOpts.find((x) => x.value === op.value);
        return { value: op.value, label: i18nPayload(prev?.label, op.label.trim()) };
      });
    }
    return out;
  });
  const desc = i18nOptionalPayload(orig?.description, s.description);
  return {
    slug: s.slug,
    name: s.name.trim(),
    title: i18nPayload(orig?.title, s.title.trim()),
    // Sem descrição e sem original: não envia (a API grava nulo).
    ...(desc !== undefined && { description: desc }),
    fields,
    submitLabel: i18nPayload(orig?.submitLabel, s.submitLabel.trim()),
    successMessage: i18nPayload(orig?.successMessage, s.successMessage.trim()),
    published: s.published,
  };
}

export function FormEditor({
  mode,
  original,
  onSaved,
}: {
  mode: "create" | "edit";
  original?: FormFull;
  onSaved?: (f: FormFull) => void;
}) {
  const router = useRouter();
  const [orig, setOrig] = useState<FormFull | null>(original ?? null);
  const initial = useMemo(() => toState(original ?? null), [original]);
  const [s, setS] = useState<State>(initial);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const dirty = JSON.stringify(s) !== savedJson;
  useUnsavedWarning(dirty);

  const patch = (p: Partial<State>) => {
    setOk(false);
    setS((prev) => ({ ...prev, ...p }));
  };
  const setField = (i: number, p: Partial<FieldState>) =>
    patch({ fields: s.fields.map((f, j) => (j === i ? { ...f, ...p } : f)) });

  function addField() {
    patch({
      fields: [
        ...s.fields,
        {
          key: keySeq++,
          id: fieldIdFrom("campo", new Set(s.fields.map((f) => f.id))),
          idTouched: false,
          type: "text",
          label: "",
          placeholder: "",
          required: false,
          options: [],
          orig: null,
        },
      ],
    });
  }

  function changeLabel(i: number, label: string) {
    const f = s.fields[i];
    if (!f.idTouched) {
      const taken = new Set(s.fields.filter((_, j) => j !== i).map((x) => x.id));
      setField(i, { label, id: fieldIdFrom(label || "campo", taken) });
    } else setField(i, { label });
  }

  async function save() {
    setApiErr(null);
    setOk(false);
    const errs = validate(s);
    setErrors(errs);
    if (errs.length > 0) return;
    setSaving(true);
    try {
      const body = toPayload(s, orig);
      if (mode === "create") {
        const d = await api.post<{ item: FormFull }>("/cms/admin/forms", body);
        router.push(`/dashboard/formularios/${d.item.id}`);
        return;
      }
      const d = await api.put<{ item: FormFull }>(`/cms/admin/forms/${orig!.id}`, body);
      const next = toState(d.item);
      setOrig({ ...d.item, submissionsCount: orig?.submissionsCount });
      setS(next);
      setSavedJson(JSON.stringify(next));
      setOk(true);
      onSaved?.(d.item);
    } catch (e) {
      // O que foi digitado continua na tela.
      setApiErr(
        e instanceof ApiError ? `Não foi possível salvar: ${e.message}` : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!orig) return;
    if (!window.confirm(`Excluir o formulário "${orig.name}"? Esta ação não pode ser desfeita.`))
      return;
    setDeleteErr(null);
    try {
      await api.delete(`/cms/admin/forms/${orig.id}`);
      router.push("/dashboard/formularios");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setDeleteErr(`${e.message} Para tirá-lo do ar, desmarque "Publicado" e salve.`);
      } else {
        setDeleteErr(e instanceof ApiError ? e.message : "Não foi possível excluir.");
      }
    }
  }

  return (
    <div className="space-y-4">
      <Notice tone="info">
        Aqui você cria formulários novos (contato, pedido de proposta etc.). Os campos da
        calculadora não são editados aqui: eles continuam no código do site porque alimentam o
        cálculo.
      </Notice>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do formulário</CardTitle>
          <CardDescription className="text-xs">
            Em produção, a mudança aparece no site em até 60 segundos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="f-name">Nome interno</Label>
              <Input
                id="f-name"
                value={s.name}
                onChange={(e) => {
                  const name = e.target.value;
                  patch({ name, ...(slugTouched ? {} : { slug: slugify(name) }) });
                }}
                placeholder="Ex.: Contato comercial"
              />
              <p className="text-[11px] text-muted-foreground">Só a equipe vê este nome.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-slug">Endereço (slug)</Label>
              <Input
                id="f-slug"
                value={s.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  patch({ slug: e.target.value });
                }}
                placeholder="contato-comercial"
              />
              <p className="text-[11px] text-muted-foreground">
                Letras minúsculas, números e hífens. Link:{" "}
                <span className="font-mono">{publicFormUrl(s.slug || "endereco")}</span>
                {mode === "edit" && " (trocar o endereço quebra links já divulgados)"}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-title">Título (aparece na página)</Label>
            <Input id="f-title" value={s.title} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="f-desc">Descrição (opcional)</Label>
            <textarea
              id="f-desc"
              rows={3}
              className={fieldCls}
              value={s.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="f-btn">Texto do botão</Label>
              <Input
                id="f-btn"
                value={s.submitLabel}
                onChange={(e) => patch({ submitLabel: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-ok">Mensagem depois do envio</Label>
              <Input
                id="f-ok"
                value={s.successMessage}
                onChange={(e) => patch({ successMessage: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={s.published}
              onChange={(e) => patch({ published: e.target.checked })}
            />
            <span>
              Publicado
              <span className="block text-xs text-muted-foreground">
                Só formulários publicados abrem no site. Despublicar tira a página do ar sem
                apagar os envios.
              </span>
            </span>
          </label>
          {mode === "edit" && orig && (
            <p className="text-xs">
              Link público:{" "}
              <a
                className="inline-flex items-center gap-1 font-mono text-primary underline"
                href={publicFormUrl(orig.slug)}
                target="_blank"
                rel="noreferrer"
              >
                {publicFormUrl(orig.slug)}
                <ExternalLink className="h-3 w-3" />
              </a>
              {!orig.published && (
                <span className="text-muted-foreground"> (ainda não publicado: o link dá erro)</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campos</CardTitle>
          <CardDescription className="text-xs">
            Os campos aparecem na ordem abaixo. O identificador é o nome com que a resposta é
            guardada; não o mude depois de já ter envios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {s.fields.length === 0 && (
            <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              Nenhum campo ainda.
            </p>
          )}
          {s.fields.map((f, i) => (
            <ItemShell
              key={f.key}
              index={i}
              count={s.fields.length}
              title={`${f.label || "Campo sem rótulo"} (${
                FIELD_TYPES.find((t) => t.value === f.type)?.label ?? f.type
              })`}
              onMove={(to) => patch({ fields: moveItem(s.fields, i, to) })}
              onRemove={() => patch({ fields: s.fields.filter((_, j) => j !== i) })}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Rótulo</Label>
                  <Input value={f.label} onChange={(e) => changeLabel(i, e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <select
                    className={selectCls}
                    value={f.type}
                    onChange={(e) =>
                      setField(i, {
                        type: e.target.value,
                        options:
                          e.target.value === "select" && f.options.length === 0
                            ? [{ value: "", label: "" }]
                            : f.options,
                      })
                    }
                  >
                    {!FIELD_TYPES.some((t) => t.value === f.type) && (
                      <option value={f.type}>{f.type} (fora da lista)</option>
                    )}
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {f.type !== "checkbox" && f.type !== "select" && (
                  <div className="space-y-1">
                    <Label>Texto de exemplo dentro do campo (opcional)</Label>
                    <Input
                      value={f.placeholder}
                      onChange={(e) => setField(i, { placeholder: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label>Identificador</Label>
                  <Input
                    value={f.id}
                    onChange={(e) => setField(i, { id: e.target.value, idTouched: true })}
                    className="font-mono"
                  />
                </div>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => setField(i, { required: e.target.checked })}
                />
                Preenchimento obrigatório
              </label>
              {f.type === "select" && (
                <div className="mt-3 space-y-2 rounded-md border p-3">
                  <div className="text-xs font-medium">Opções da lista</div>
                  {f.options.map((o, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Input
                        aria-label="Texto da opção"
                        placeholder="Texto que a pessoa vê"
                        value={o.label}
                        onChange={(e) =>
                          setField(i, {
                            options: f.options.map((x, k) =>
                              k === j ? { ...x, label: e.target.value } : x,
                            ),
                          })
                        }
                      />
                      <Input
                        aria-label="Valor da opção"
                        placeholder="Valor guardado"
                        className="font-mono"
                        value={o.value}
                        onChange={(e) =>
                          setField(i, {
                            options: f.options.map((x, k) =>
                              k === j ? { ...x, value: e.target.value } : x,
                            ),
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Remover opção"
                        onClick={() =>
                          setField(i, { options: f.options.filter((_, k) => k !== j) })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setField(i, { options: [...f.options, { value: "", label: "" }] })
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Adicionar opção
                  </Button>
                </div>
              )}
            </ItemShell>
          ))}
          <Button type="button" variant="outline" onClick={addField}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar campo
          </Button>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Notice tone="error">
          <ul className="list-disc pl-4">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </Notice>
      )}
      {apiErr && <Notice tone="error">{apiErr}</Notice>}
      {ok && !dirty && (
        <Notice tone="success">Salvo. Em produção, a mudança aparece no site em até 60 segundos.</Notice>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={saving || (mode === "edit" && !dirty)}>
          {saving ? "Salvando…" : mode === "create" ? "Criar formulário" : "Salvar"}
        </Button>
        {dirty && mode === "edit" && (
          <span className="text-xs text-yellow-800">Alterações não salvas</span>
        )}
      </div>

      {mode === "edit" && orig && (
        <div className="space-y-2 border-t pt-4">
          <div className="text-sm font-medium">Excluir formulário</div>
          <p className="text-xs text-muted-foreground">
            Só é possível excluir um formulário que ainda não recebeu envios. Se já recebeu,
            despublique em vez de excluir.
          </p>
          {deleteErr && <Notice tone="error">{deleteErr}</Notice>}
          <Button variant="destructive" size="sm" onClick={remove}>
            <Trash2 className="mr-1 h-3 w-3" />
            Excluir formulário
          </Button>
        </div>
      )}
    </div>
  );
}
