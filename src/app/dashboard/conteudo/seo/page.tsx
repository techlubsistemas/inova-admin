"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { SAVED_NOTICE, i18nPayload, tx } from "@/lib/i18n";
import { useUnsavedWarning } from "@/lib/use-unsaved";
import { PageHeader } from "@/components/page-header";
import { ImageField } from "@/components/image-field";
import { Notice, fieldCls } from "@/components/structured/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Meta = {
  route: string;
  title: unknown;
  description: unknown;
  ogImageUrl: string | null;
  updatedAt: string;
};

type EditState = {
  titlePt: string;
  descriptionPt: string;
  ogImageUrl: string;
};

export default function SeoPage() {
  const [items, setItems] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ titlePt: "", descriptionPt: "", ogImageUrl: "" });
  const [original, setOriginal] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRoute, setSavedRoute] = useState<string | null>(null);

  const dirty =
    editing !== null && original !== null && JSON.stringify(editState) !== JSON.stringify(original);
  useUnsavedWarning(dirty);

  useEffect(() => {
    api
      .get<{ items: Meta[] }>("/cms/admin/seo")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(m: Meta) {
    if (dirty && !confirm("Há alterações não salvas nesta página. Descartar e editar outra?")) return;
    const state = {
      titlePt: tx(m.title as never, ""),
      descriptionPt: tx(m.description as never, ""),
      ogImageUrl: m.ogImageUrl ?? "",
    };
    setEditing(m.route);
    setSaveError(null);
    setSavedRoute(null);
    setEditState(state);
    setOriginal(state);
  }

  function cancelEdit() {
    setEditing(null);
    setSaveError(null);
  }

  async function saveEdit(m: Meta) {
    if (!editState.titlePt.trim() || !editState.descriptionPt.trim()) {
      setSaveError("Preencha o título e a descrição.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.put<{ item: Meta }>("/cms/admin/seo", {
        route: m.route,
        // Mantém a tradução em inglês que já existe.
        title: i18nPayload(m.title, editState.titlePt),
        description: i18nPayload(m.description, editState.descriptionPt),
        ogImageUrl: editState.ogImageUrl.trim() || null,
      });
      setItems((prev) => prev.map((x) => (x.route === m.route ? updated.item : x)));
      setEditing(null);
      setSavedRoute(m.route);
    } catch (err) {
      // O texto digitado continua na tela.
      setSaveError(err instanceof ApiError ? `Não foi possível salvar: ${err.message}` : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Aparência no Google (SEO) por página"
        description={`Título, descrição e imagem de compartilhamento de cada página do site. ${items.length} páginas cadastradas.`}
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <Notice tone="error">{error}</Notice>}
      {savedRoute && (
        <div className="mb-3">
          <Notice tone="success">
            {savedRoute}: {SAVED_NOTICE}
          </Notice>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <Notice tone="warning">
          Nenhuma página cadastrada ainda. Peça à equipe técnica para rodar o seed do CMS na API.
        </Notice>
      )}

      <div className="space-y-2">
        {items.map((m) => (
          <div key={m.route} className="rounded-lg border bg-card">
            {editing === m.route ? (
              <div className="space-y-3 p-4">
                <div className="font-mono text-xs font-semibold text-muted-foreground">{m.route}</div>
                <div className="space-y-1">
                  <Label htmlFor={`title-${m.route}`}>Título (aparece na aba do navegador e no Google)</Label>
                  <Input
                    id={`title-${m.route}`}
                    value={editState.titlePt}
                    onChange={(e) => setEditState((s) => ({ ...s, titlePt: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`desc-${m.route}`}>Descrição (texto curto abaixo do título no Google)</Label>
                  <textarea
                    id={`desc-${m.route}`}
                    rows={3}
                    value={editState.descriptionPt}
                    onChange={(e) => setEditState((s) => ({ ...s, descriptionPt: e.target.value }))}
                    className={fieldCls}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`og-${m.route}`}>Imagem ao compartilhar o link nas redes</Label>
                  <ImageField
                    id={`og-${m.route}`}
                    value={editState.ogImageUrl}
                    onChange={(v) => setEditState((s) => ({ ...s, ogImageUrl: v }))}
                  />
                </div>
                {saveError && <Notice tone="error">{saveError}</Notice>}
                <div className="flex gap-2">
                  <Button size="sm" disabled={saving} onClick={() => saveEdit(m)}>
                    {saving ? "Salvando…" : "Salvar"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-mono text-xs text-muted-foreground">{m.route}</div>
                  <div className="text-sm font-medium">{tx(m.title as never)}</div>
                  <div className="line-clamp-2 text-sm text-muted-foreground">{tx(m.description as never)}</div>
                  {m.ogImageUrl && (
                    <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      Imagem de compartilhamento definida
                    </span>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(m)}>
                  Editar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
