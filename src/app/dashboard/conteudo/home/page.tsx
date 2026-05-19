"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { SettingEditor, type Setting } from "@/components/setting-editor";

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
};

export default function ContentHomePage() {
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Setting[] }>("/cms/admin/settings")
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
