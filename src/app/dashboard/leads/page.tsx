"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

type Lead = {
  id: string;
  createdAt: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string | null;
  cargo: string | null;
  status: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
};

const STATUSES = ["novo", "contatado", "qualificado", "ganho", "perdido"] as const;

const STATUS_STYLES: Record<string, string> = {
  novo: "bg-primary/10 text-primary",
  contatado: "bg-blue-100 text-blue-800",
  qualificado: "bg-yellow-100 text-yellow-900",
  ganho: "bg-green-100 text-green-800",
  perdido: "bg-muted text-muted-foreground",
};

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Lead[] }>("/cms/admin/leads")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id: string, status: string) {
    setUpdatingId(id);
    setUpdateError(null);
    try {
      const data = await api.patch<{ item: Lead }>(`/cms/admin/leads/${id}`, { status });
      setItems((prev) => prev.map((l) => (l.id === id ? data.item : l)));
    } catch (e) {
      setUpdateError(e instanceof ApiError ? e.message : "Erro ao atualizar status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Leads da calculadora"
        description={`${items.length} lead${items.length === 1 ? "" : "s"} captado${items.length === 1 ? "" : "s"}.`}
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}
      {updateError && (
        <div className="mb-3 text-sm text-destructive">{updateError}</div>
      )}

      {!loading && items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm font-medium">Nenhum lead ainda</div>
            <div className="text-xs text-muted-foreground">
              Quando alguém preencher a calculadora no site, o lead aparece aqui com inputs, resultado e dados de contato.
            </div>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Telefone</th>
                <th className="px-4 py-2">Empresa</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-2 font-medium">{l.nome}</td>
                  <td className="px-4 py-2">{l.email}</td>
                  <td className="px-4 py-2">{l.telefone}</td>
                  <td className="px-4 py-2">{l.empresa ?? "—"}</td>
                  <td className="px-4 py-2">
                    <select
                      value={l.status}
                      disabled={updatingId === l.id}
                      onChange={(e) => changeStatus(l.id, e.target.value)}
                      className={`rounded-full border-0 px-2 py-1 text-[11px] font-medium ${
                        STATUS_STYLES[l.status] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
