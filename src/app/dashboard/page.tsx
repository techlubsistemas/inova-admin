"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { tx } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Overview = {
  stats: {
    leadsLast24h: number;
    pageViewsToday: number;
    casesPublished: number;
    articlesPublished: number;
  };
  recentLeads: Array<{
    id: string;
    nome: string;
    email: string;
    empresa: string | null;
    status: string;
    createdAt: string;
  }>;
  recentCases: Array<{
    id: string;
    slug: string;
    clienteAnonimo: { pt: string; en: string | null };
    updatedAt: string;
    published: boolean;
  }>;
};

const STATUS_STYLES: Record<string, string> = {
  novo: "bg-primary/10 text-primary",
  contatado: "bg-blue-100 text-blue-800",
  qualificado: "bg-yellow-100 text-yellow-900",
  ganho: "bg-green-100 text-green-800",
  perdido: "bg-muted text-muted-foreground",
};

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

export default function DashboardHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Overview>("/cms/admin/dashboard/overview")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Leads novos (24h)",
      value: data?.stats.leadsLast24h ?? "—",
      href: "/dashboard/leads",
    },
    {
      label: "Visitas hoje",
      value: data?.stats.pageViewsToday ?? "—",
      href: "/dashboard/analytics",
    },
    {
      label: "Cases publicados",
      value: data?.stats.casesPublished ?? "—",
      href: "/dashboard/cases",
    },
    {
      label: "Artigos publicados",
      value: data?.stats.articlesPublished ?? "—",
      href: "/dashboard/articles",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo</h1>
        <p className="text-sm text-muted-foreground">
          Painel administrativo Inova.
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          Erro ao carregar overview: {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="cursor-pointer transition-colors hover:bg-accent/40">
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {loading ? "…" : s.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos leads</CardTitle>
            <CardDescription>
              5 mais recentes da calculadora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-sm text-muted-foreground">Carregando…</div>
            )}
            {!loading && data && data.recentLeads.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhum lead ainda.
              </div>
            )}
            {!loading && data && data.recentLeads.length > 0 && (
              <ul className="space-y-3">
                {data.recentLeads.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {l.nome}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {l.empresa ?? l.email}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[l.status] ?? "bg-muted"}`}
                      >
                        {l.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(l.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases editados recentemente</CardTitle>
            <CardDescription>5 últimos com alterações.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-sm text-muted-foreground">Carregando…</div>
            )}
            {!loading && data && data.recentCases.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhum case ainda.
              </div>
            )}
            {!loading && data && data.recentCases.length > 0 && (
              <ul className="space-y-3">
                {data.recentCases.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="flex items-center justify-between gap-3 hover:underline"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {tx(c.clienteAnonimo)}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {c.slug}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!c.published && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            rascunho
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatRelative(c.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
