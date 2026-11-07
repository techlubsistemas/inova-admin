"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { api, ApiError, downloadFile } from "@/lib/api";
import { ptText } from "@/lib/i18n";
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

type Sub = {
  id: string;
  createdAt: string;
  data: Record<string, unknown>;
  status: string;
  notasAdmin: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
};

type FieldDef = { id: string; type?: string; label?: unknown; options?: unknown };

const STATUSES = [
  { value: "novo", label: "Novo" },
  { value: "contatado", label: "Contatado" },
  { value: "qualificado", label: "Qualificado" },
  { value: "ganho", label: "Ganho" },
  { value: "perdido", label: "Perdido" },
];
const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

const PAGE_SIZE = 25;

function showValue(def: FieldDef | undefined, v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  if (def?.type === "checkbox") return v === true ? "Sim" : "Não";
  if (def?.type === "select" && Array.isArray(def.options)) {
    const o = (def.options as { value?: unknown; label?: unknown }[]).find((x) => x.value === v);
    if (o) return ptText(o.label) || String(v);
  }
  return typeof v === "string" ? v : JSON.stringify(v);
}

export function Submissions({ formId, fields }: { formId: string; fields: unknown }) {
  const defs = (Array.isArray(fields) ? fields : []) as FieldDef[];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Sub[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Sub | null>(null);
  const debounced = useDebounced(search);
  const reqId = useRef(0);

  const filters = { search: debounced.trim() || undefined, status: status || undefined };
  const filterKey = JSON.stringify(filters);
  const hasFilter = Object.values(filters).some(Boolean);
  const base = `/cms/admin/forms/${formId}`;

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const d = await api.get<{ items: Sub[]; total: number }>(
        `${base}/submissions${qs({ ...JSON.parse(filterKey), page, pageSize: PAGE_SIZE })}`,
      );
      if (id !== reqId.current) return;
      setItems(d.items);
      setTotal(d.total);
    } catch (e) {
      if (id === reqId.current) setError(e instanceof ApiError ? e.message : "Erro ao carregar");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [base, filterKey, page]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const [exporting, setExporting] = useState(false);
  const [exportErr, setExportErr] = useState<string | null>(null);
  async function exportCsv() {
    setExporting(true);
    setExportErr(null);
    try {
      await downloadFile(`${base}/export${qs(filters)}`, "formulario.csv");
    } catch (e) {
      setExportErr(e instanceof ApiError ? e.message : "Não foi possível baixar o arquivo.");
    } finally {
      setExporting(false);
    }
  }

  const summaryDefs = defs.slice(0, 2);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label className="text-xs text-muted-foreground">Buscar nas respostas</label>
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
        <Button variant="outline" onClick={exportCsv} disabled={exporting}>
          <Download className="mr-1 h-4 w-4" />
          {exporting ? "Gerando…" : "Baixar CSV"}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        O arquivo CSV leva os mesmos filtros que estão na tela.
      </p>
      {exportErr && <Notice tone="error">{exportErr}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-2">Data</th>
              {summaryDefs.map((d) => (
                <th key={d.id} className="px-4 py-2">
                  {ptText(d.label) || d.id}
                </th>
              ))}
              <th className="px-4 py-2">Situação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelected(r)}
                className={`cursor-pointer border-t hover:bg-accent/40 ${
                  selected?.id === r.id ? "bg-accent/60" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                  {fmtDate(r.createdAt)}
                </td>
                {summaryDefs.map((d) => (
                  <td key={d.id} className="max-w-[16rem] truncate px-4 py-2">
                    {showValue(d, r.data?.[d.id])}
                  </td>
                ))}
                <td className="px-4 py-2 text-xs">{statusLabel(r.status)}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={2 + summaryDefs.length}
                  className="px-4 py-8 text-center text-xs text-muted-foreground"
                >
                  {hasFilter
                    ? "Nenhum envio encontrado com esses filtros."
                    : "Nenhum envio ainda."}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={2 + summaryDefs.length}
                  className="px-4 py-6 text-center text-xs text-muted-foreground"
                >
                  Carregando...
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
        <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} noun="envios" />
      </div>

      {selected && (
        <SubDetail
          key={selected.id}
          sub={selected}
          defs={defs}
          onChange={(s) => {
            setItems((p) => p.map((x) => (x.id === s.id ? s : x)));
            setSelected(s);
          }}
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

function SubDetail({
  sub,
  defs,
  onChange,
  onDeleted,
  onClose,
}: {
  sub: Sub;
  defs: FieldDef[];
  onChange: (s: Sub) => void;
  onDeleted: () => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(sub.notasAdmin ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const notesDirty = notes !== (sub.notasAdmin ?? "");

  // Campos conhecidos na ordem do formulário; respostas de campos que não existem mais vêm depois.
  const known = new Set(defs.map((d) => d.id));
  const extra = Object.keys(sub.data ?? {}).filter((k) => !known.has(k));

  async function patch(body: { status?: string; notasAdmin?: string }, okMsg: string) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const d = await api.patch<{ item: Sub }>(`/cms/admin/form-submissions/${sub.id}`, body);
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
    if (!window.confirm("Excluir este envio? Esta ação não pode ser desfeita.")) return;
    setBusy(true);
    setErr(null);
    try {
      await api.delete(`/cms/admin/form-submissions/${sub.id}`);
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
          <div className="text-base font-semibold">Envio</div>
          <div className="text-xs text-muted-foreground">Recebido em {fmtDate(sub.createdAt)}</div>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-medium">Respostas</h3>
          {defs.map((d) => (
            <DetailRow key={d.id} label={ptText(d.label) || d.id}>
              {showValue(d, sub.data?.[d.id])}
            </DetailRow>
          ))}
          {extra.map((k) => (
            <DetailRow key={k} label={`${k} (campo removido)`}>
              {showValue(undefined, sub.data[k])}
            </DetailRow>
          ))}
        </div>
        <div>
          <h3 className="mb-1 text-sm font-medium">Origem</h3>
          <DetailRow label="Veio de">{sub.referrer || "—"}</DetailRow>
          <DetailRow label="Fonte (utm_source)">{sub.utmSource || "—"}</DetailRow>
          <DetailRow label="Meio (utm_medium)">{sub.utmMedium || "—"}</DetailRow>
          <DetailRow label="Campanha (utm_campaign)">{sub.utmCampaign || "—"}</DetailRow>
          <DetailRow label="Conteúdo (utm_content)">{sub.utmContent || "—"}</DetailRow>
        </div>
      </div>
      <div className="mt-5 space-y-3 border-t pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">Situação</label>
          <select
            className={statusSelectCls}
            value={sub.status}
            disabled={busy}
            onChange={(e) => patch({ status: e.target.value }, "Situação atualizada.")}
          >
            {!STATUSES.some((s) => s.value === sub.status) && (
              <option value={sub.status}>{sub.status}</option>
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
            Excluir este envio
          </Button>
        </div>
      </div>
    </div>
  );
}
