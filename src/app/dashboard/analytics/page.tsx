"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Summary = {
  pageViewsTotal: number;
  pageViews7d: number;
  pageViews30d: number;
  leadsTotal: number;
  leads7d: number;
  leadsByStatus: { status: string; count: number }[];
  topPaths: { path: string; count: number }[];
  topEvents: { eventName: string; count: number }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Summary>("/cms/admin/analytics/summary")
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Visitas, eventos e leads — atualizados em tempo real conforme o tracker dispara no site público."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {data && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Page views (total)" value={data.pageViewsTotal} />
            <StatCard label="Page views (30d)" value={data.pageViews30d} />
            <StatCard label="Page views (7d)" value={data.pageViews7d} />
            <StatCard label="Leads (7d)" value={data.leads7d} />
          </div>

          {/* Leads por status + Top eventos */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Leads por status (total {data.leadsTotal})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.leadsByStatus.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem leads ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.leadsByStatus.map((s) => (
                      <li
                        key={s.status}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize">{s.status}</span>
                        <span className="font-semibold">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top eventos (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum evento rastreado ainda.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.topEvents.map((e) => (
                      <li
                        key={e.eventName}
                        className="flex items-center justify-between text-sm"
                      >
                        <code className="text-xs">{e.eventName}</code>
                        <span className="font-semibold">{e.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top páginas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top páginas (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topPaths.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sem visitas ainda.</p>
              ) : (
                <ul className="divide-y">
                  {data.topPaths.map((p) => (
                    <li
                      key={p.path}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <code className="text-xs">{p.path}</code>
                      <span className="font-semibold">{p.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 text-3xl font-semibold">
          {value.toLocaleString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  );
}
