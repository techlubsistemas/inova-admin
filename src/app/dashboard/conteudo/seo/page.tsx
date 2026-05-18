"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Meta = {
  route: string;
  title: { pt: string; en: string | null };
  description: { pt: string; en: string | null };
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Meta[] }>("/admin/seo")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(m: Meta) {
    setEditing(m.route);
    setSaveError(null);
    setEditState({
      titlePt: tx(m.title),
      descriptionPt: tx(m.description),
      ogImageUrl: m.ogImageUrl ?? "",
    });
  }

  function cancelEdit() {
    setEditing(null);
    setSaveError(null);
  }

  async function saveEdit(route: string) {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.put<{ item: Meta }>("/admin/seo", {
        route,
        title: { pt: editState.titlePt, en: null },
        description: { pt: editState.descriptionPt, en: null },
        ogImageUrl: editState.ogImageUrl.trim() || null,
      });
      setItems((prev) => prev.map((m) => (m.route === route ? updated.item : m)));
      setEditing(null);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="SEO por página"
        description={`Title, description e OG image de cada rota. ${items.length} rotas cadastradas.`}
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="space-y-2">
        {items.map((m) => (
          <div key={m.route} className="rounded-lg border bg-card">
            {editing === m.route ? (
              <div className="space-y-3 p-4">
                <div className="font-mono text-xs font-semibold text-muted-foreground">
                  {m.route}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`title-${m.route}`}>Title (PT)</Label>
                  <Input
                    id={`title-${m.route}`}
                    value={editState.titlePt}
                    onChange={(e) => setEditState((s) => ({ ...s, titlePt: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`desc-${m.route}`}>Description (PT)</Label>
                  <textarea
                    id={`desc-${m.route}`}
                    rows={3}
                    value={editState.descriptionPt}
                    onChange={(e) => setEditState((s) => ({ ...s, descriptionPt: e.target.value }))}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`og-${m.route}`}>OG Image URL</Label>
                  <Input
                    id={`og-${m.route}`}
                    value={editState.ogImageUrl}
                    onChange={(e) => setEditState((s) => ({ ...s, ogImageUrl: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                {saveError && (
                  <p className="text-xs text-destructive">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" disabled={saving} onClick={() => saveEdit(m.route)}>
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
                  <div className="text-sm font-medium">{tx(m.title)}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {tx(m.description)}
                  </div>
                  {m.ogImageUrl && (
                    <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      OG configurada
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
