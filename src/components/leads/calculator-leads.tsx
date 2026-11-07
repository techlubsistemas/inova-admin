"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { api, ApiError, downloadFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/structured/ui";
import {
  DetailRow,
  Pager,
  fmtDate,
  qs,
  statusSelectCls,
  useDebounced,
} from "@/components/list-kit";

type Lead = {
  id: string;
  createdAt: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string | null;
  cargo: string | null;
  status: string;
  notasAdmin: string | null;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  locale?: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  consentLgpd?: boolean;
};

const STATUSES = [
  { value: "novo", label: "Novo" },
  { value: "contatado", label: "Contatado" },
  { value: "qualificado", label: "Qualificado" },
  { value: "ganho", label: "Ganho" },
  { value: "perdido", label: "Perdido" },
];
const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

const INPUT_LABELS: Record<string, string> = {
  setor: "Setor",
  ativosCriticos: "Ativos críticos",
  horasAnoOperacao: "Horas de operação por ano",
  mtbfMeses: "MTBF (meses)",
  custoParadaHora: "Custo da parada por hora (R$)",
  consumoLubrificanteAno: "Consumo de lubrificante (L/ano)",
  nivelContaminacao: "Nível de contaminação",
};

function labelFor(key: string) {
  if (INPUT_LABELS[key]) return INPUT_LABELS[key];
  const t = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function fmtValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function Pairs({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) return <p className="text-xs text-muted-foreground">Sem dados.</p>;
  return (
    <div>
      {entries.map(([k, v]) => (
        <DetailRow key={k} label={labelFor(k)}>
          {v !== null && typeof v === "object" && !Array.isArray(v) ? (
            <div className="space-y-0.5 text-xs">
              {Object.entries(v as Record<string, unknown>).map(([k2, v2]) => (
                <div key={k2}>
                  <span className="text-muted-foreground">{labelFor(k2)}:</span> {fmtValue(v2)}
                </div>
              ))}
            </div>
          ) : (
            fmtValue(v)
          )}
        </DetailRow>
      ))}
    </div>
  );
}

const PAGE_SIZE = 25;

export function CalculatorLeads() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const debounced = useDebounced(search);
  const reqId = useRef(0);

  const filters = {
    search: debounced.trim() || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
  };
  const filterKey = JSON.stringify(filters);
  const hasFilter = Object.values(filters).some(Boolean);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const d = await api.get<{ items: Lead[]; total: number }>(
        `/cms/admin/leads${qs({ ...JSON.parse(filterKey), page, pageSize: PAGE_SIZE })}`,
      );
      if (id !== reqId.current) return;
      setItems(d.items);
      setTotal(d.total);
    } catch (e) {
      if (id === reqId.current) setError(e instanceof ApiError ? e.message : "Erro ao carregar");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [filterKey, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Mudou o filtro: volta para a primeira página.
  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const [exporting, setExporting] = useState(false);
  const [exportErr, setExportErr] = useState<string | null>(null);
  async function exportCsv() {
    setExporting(true);
    setExportErr(null);
    try {
      await downloadFile(`/cms/admin/leads/export${qs(filters)}`, "leads-calculadora.csv");
    } catch (e) {
      setExportErr(e instanceof ApiError ? e.message : "Não foi possível baixar o arquivo.");
    } finally {
      setExporting(false);
    }
  }

  function replace(item: Lead) {
    setItems((p) => p.map((l) => (l.id === item.id ? item : l)));
    setSelected(item);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label className="text-xs text-muted-foreground">Buscar por nome, e-mail ou empresa</label>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Situação</label>
          <select
            className={`${statusSelectCls} block`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todas</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">De</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Até</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={exporting}>
          <Download className="mr-1 h-4 w-4" />
          {exporting ? "Gerando…" : "Baixar CSV"}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        O arquivo CSV leva os mesmos filtros que estão na tela (situação, busca e período).
      </p>
      {exportErr && <Notice tone="error">{exportErr}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Empresa</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">Situação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr
                key={l.id}
                onClick={() => setSelected(l)}
                className={`cursor-pointer border-t hover:bg-accent/40 ${
                  selected?.id === l.id ? "bg-accent/60" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                  {fmtDate(l.createdAt)}
                </td>
                <td className="px-4 py-2 font-medium">{l.nome}</td>
                <td className="px-4 py-2">{l.empresa ?? "—"}</td>
                <td className="px-4 py-2">{l.email}</td>
                <td className="px-4 py-2 text-xs">{statusLabel(l.status)}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  {hasFilter
                    ? "Nenhum lead encontrado com esses filtros."
                    : "Nenhum lead ainda. Quando alguém preencher a calculadora no site, ele aparece aqui."}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} noun="leads" />
      </div>

      {selected && (
        <LeadDetail
          key={selected.id}
          lead={selected}
          onChange={replace}
          onDeleted={() => {
            setSelected(null);
            load();
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function LeadDetail({
  lead,
  onChange,
  onDeleted,
  onClose,
}: {
  lead: Lead;
  onChange: (l: Lead) => void;
  onDeleted: () => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(lead.notasAdmin ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const notesDirty = notes !== (lead.notasAdmin ?? "");

  async function patch(body: { status?: string; notasAdmin?: string }, okMsg: string) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const d = await api.patch<{ item: Lead }>(`/cms/admin/leads/${lead.id}`, body);
      onChange(d.item);
      setMsg(okMsg);
    } catch (e) {
      setErr(
        e instanceof ApiError ? `Não foi possível salvar: ${e.message}` : "Não foi possível salvar.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Excluir o lead de ${lead.nome}? Esta ação não pode ser desfeita.`)) return;
    setBusy(true);
    setErr(null);
    try {
      await api.delete(`/cms/admin/leads/${lead.id}`);
      onDeleted();
    } catch (e) {
      setErr(
        e instanceof ApiError
          ? `Não foi possível excluir: ${e.message}`
          : "Não foi possível excluir.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{lead.nome}</div>
          <div className="text-xs text-muted-foreground">Recebido em {fmtDate(lead.createdAt)}</div>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-medium">Contato</h3>
          <DetailRow label="E-mail">
            <a className="text-primary underline" href={`mailto:${lead.email}`}>
              {lead.email}
            </a>
          </DetailRow>
          <DetailRow label="Telefone">{lead.telefone}</DetailRow>
          <DetailRow label="Empresa">{lead.empresa || "—"}</DetailRow>
          <DetailRow label="Cargo">{lead.cargo || "—"}</DetailRow>
          <h3 className="mb-1 mt-4 text-sm font-medium">Origem</h3>
          <DetailRow label="Idioma">{lead.locale ?? "—"}</DetailRow>
          <DetailRow label="Veio de">{lead.referrer || "—"}</DetailRow>
          <DetailRow label="Fonte (utm_source)">{lead.utmSource || "—"}</DetailRow>
          <DetailRow label="Meio (utm_medium)">{lead.utmMedium || "—"}</DetailRow>
          <DetailRow label="Campanha (utm_campaign)">{lead.utmCampaign || "—"}</DetailRow>
          <DetailRow label="Conteúdo (utm_content)">{lead.utmContent || "—"}</DetailRow>
          <DetailRow label="Aceitou a política de privacidade">
            {lead.consentLgpd ? "Sim" : "Não"}
          </DetailRow>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-medium">O que a pessoa informou</h3>
          <Pairs data={lead.inputs} />
          <h3 className="mb-1 mt-4 text-sm font-medium">Resultado calculado</h3>
          <Pairs data={lead.outputs} />
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">Situação</label>
          <select
            className={statusSelectCls}
            value={lead.status}
            disabled={busy}
            onChange={(e) => patch({ status: e.target.value }, "Situação atualizada.")}
          >
            {!STATUSES.some((s) => s.value === lead.status) && (
              <option value={lead.status}>{lead.status}</option>
            )}
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Anotações internas</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Só a equipe vê estas anotações."
          />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              disabled={busy || !notesDirty}
              onClick={() => patch({ notasAdmin: notes }, "Anotações salvas.")}
            >
              Salvar anotações
            </Button>
            {notesDirty && (
              <span className="self-center text-xs text-yellow-800">Anotações não salvas</span>
            )}
          </div>
        </div>
        {err && <Notice tone="error">{err}</Notice>}
        {msg && !err && <Notice tone="success">{msg}</Notice>}
        <div className="border-t pt-3">
          <Button size="sm" variant="destructive" disabled={busy} onClick={remove}>
            <Trash2 className="mr-1 h-3 w-3" />
            Excluir este lead
          </Button>
        </div>
      </div>
    </div>
  );
}
