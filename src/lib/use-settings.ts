"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Setting } from "@/components/setting-editor";

/** Carrega todas as settings do site. `map[chave]` é indefinido se ainda não existe no banco. */
export function useSettings() {
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ items: Setting[] }>("/cms/admin/settings")
      .then((d) => {
        if (!cancelled) setItems(d.items);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const map: Record<string, Setting | undefined> = {};
  for (const i of items) map[i.key] = i;
  return { items, map, loading, error };
}

export const SEED_HINT =
  "O banco ainda não tem o conteúdo inicial do site (nenhuma configuração foi encontrada). Peça à equipe técnica para rodar o seed do CMS na API. Mesmo assim, você já pode preencher e salvar: o que ficar em branco continua com o texto padrão do site.";
