"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Setting = {
  key: string;
  value: unknown;
  updatedAt: string;
};

const HOME_KEYS: Record<string, { label: string; description: string }> = {
  hero: {
    label: "Hero (topo da home)",
    description:
      "Eyebrow, título, descrição, CTAs e estatísticas. Campos suportados: eyebrow, titleLine1, titleHighlight, titleLine2, description, ctaPrimary{label,href}, ctaSecondary{label,href}, backgroundImage, stats[{value,label}].",
  },
  authority: {
    label: "Autoridade",
    description: "6 pilares + métricas-chave.",
  },
  results: {
    label: "Soluções (Results)",
    description: "Inov.IA, Análise de Lubrificantes, Diagnóstico.",
  },
  projects_highlight: {
    label: "Case em destaque (Projects)",
    description: "Card grande na home.",
  },
  cta_cards: {
    label: "CTAs (2 caminhos)",
    description: "Consultoria humana × Plataforma Inov.IA.",
  },
  testimonials: {
    label: "Timeline (Milestones)",
    description: "3 marcos da empresa.",
  },
  team_partners: {
    label: "Parceiros/Clientes",
    description: "Logo wall.",
  },
  footer: {
    label: "Footer",
    description: "Navegação, contatos e redes sociais.",
  },
};

export default function ContentHomePage() {
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Setting[] }>("/admin/settings")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(key: string, updated: Setting) {
    setItems((prev) => prev.map((i) => (i.key === key ? updated : i)));
  }

  const homeItems = items.filter((i) => HOME_KEYS[i.key]);

  return (
    <div>
      <PageHeader
        title="Conteúdo da home"
        description="Edite o JSON de cada seção. As mudanças aparecem no site após o cache ISR (até 60s em produção, instantâneo em dev)."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="space-y-4">
        {homeItems.map((item) => (
          <SettingEditor
            key={item.key}
            item={item}
            meta={HOME_KEYS[item.key]}
            onSaved={(updated) => handleSaved(item.key, updated)}
          />
        ))}
      </div>
    </div>
  );
}

function SettingEditor({
  item,
  meta,
  onSaved,
}: {
  item: Setting;
  meta: { label: string; description: string };
  onSaved: (updated: Setting) => void;
}) {
  const [text, setText] = useState(JSON.stringify(item.value, null, 2));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function save() {
    setErr(null);
    setOk(false);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      setErr("JSON inválido. Confira chaves, vírgulas e aspas.");
      return;
    }
    setSaving(true);
    try {
      const data = await api.put<{ item: Setting }>(
        `/admin/settings/${item.key}`,
        { value: parsed },
      );
      onSaved(data.item);
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{meta.label}</CardTitle>
            <CardDescription className="text-xs">{meta.description}</CardDescription>
          </div>
          <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            key: {item.key}
          </code>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
          spellCheck={false}
        />
        {err && (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {err}
          </p>
        )}
        {ok && (
          <p className="mt-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            Salvo. As mudanças aparecem no site dentro do tempo de ISR.
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setText(JSON.stringify(item.value, null, 2))}
          >
            Reverter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
