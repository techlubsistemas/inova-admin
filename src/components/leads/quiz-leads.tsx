"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
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

type Quiz = {
  id: string;
  createdAt: string;
  leadNome: string;
  leadEmpresa: string;
  leadCargo: string;
  leadEmail: string;
  leadTelefone: string;
  leadEquipamentos?: string | null;
  score: number;
  profile: string;
  status: string;
  contactedAt?: string | null;
  notes?: string | null;
  answers?: Record<string, unknown>;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

// Valores exatamente como a API os usa.
const STATUSES = [
  { value: "NEW", label: "Novo" },
  { value: "CONTACTED", label: "Contatado" },
  { value: "IN_NEGOTIATION", label: "Em negociação" },
  { value: "WON", label: "Ganho" },
  { value: "LOST", label: "Perdido" },
];
const PROFILES = [
  { value: "MADURO", label: "Maduro" },
  { value: "EM_EVOLUCAO", label: "Em evolução" },
  { value: "REATIVO", label: "Reativo" },
  { value: "CRITICO", label: "Crítico" },
];
const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;
const profileLabel = (s: string) => PROFILES.find((x) => x.value === s)?.label ?? s;

// Cada letra vale pontos: a = 0 ... e = 4 (cada pergunta; 20 perguntas, máximo 80).
const POINTS: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };

const PAGE_SIZE = 25;

export function QuizLeads() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Quiz[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounced = useDebounced(search);
  const reqId = useRef(0);

  const filters = {
    search: debounced.trim() || undefined,
    status: status || undefined,
    profile: profile || undefined,
  };
  const filterKey = JSON.stringify(filters);
  const hasFilter = Object.values(filters).some(Boolean);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const d = await api.get<{ items: Quiz[]; total: number }>(
        `/cms/admin/quiz-submissions${qs({ ...JSON.parse(filterKey), page, pageSize: PAGE_SIZE })}`,
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

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  return (
    <div className="space-y-3">
      <Notice tone="info">
        Estes são os resultados do diagnóstico (quiz) do site. Esta lista não se mistura com a da
        calculadora. O quiz não envia aviso por e-mail: confira esta lista com frequência.
      </Notice>
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
          <label className="text-xs text-muted-foreground">Perfil</label>
          <select
            className={`${statusSelectCls} block`}
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
          >
            <option value="">Todos</option>
            {PROFILES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Empresa</th>
              <th className="px-4 py-2">Pontuação</th>
              <th className="px-4 py-2">Perfil</th>
              <th className="px-4 py-2">Situação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr
                key={q.id}
                onClick={() => setSelectedId(q.id)}
                className={`cursor-pointer border-t hover:bg-accent/40 ${
                  selectedId === q.id ? "bg-accent/60" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                  {fmtDate(q.createdAt)}
                </td>
                <td className="px-4 py-2 font-medium">{q.leadNome}</td>
                <td className="px-4 py-2">{q.leadEmpresa}</td>
                <td className="px-4 py-2">{q.score} de 80</td>
                <td className="px-4 py-2 text-xs">{profileLabel(q.profile)}</td>
                <td className="px-4 py-2 text-xs">{statusLabel(q.status)}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  {hasFilter
                    ? "Nenhum diagnóstico encontrado com esses filtros."
                    : "Nenhum diagnóstico ainda. Quando alguém concluir o quiz no site, ele aparece aqui."}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
        <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} noun="diagnósticos" />
      </div>

      {selectedId && (
        <QuizDetail
          key={selectedId}
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={(q) =>
            setItems((p) =>
              p.map((x) => (x.id === q.id ? { ...x, status: q.status, contactedAt: q.contactedAt } : x)),
            )
          }
        />
      )}
    </div>
  );
}

function QuizDetail({
  id,
  onClose,
  onUpdated,
}: {
  id: string;
  onClose: () => void;
  onUpdated: (q: Quiz) => void;
}) {
  const [item, setItem] = useState<Quiz | null>(null);
  const [notes, setNotes] = useState("");
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ item: Quiz }>(`/cms/admin/quiz-submissions/${id}`)
      .then((d) => {
        setItem(d.item);
        setNotes(d.item.notes ?? "");
      })
      .catch((e) => setLoadErr(e instanceof ApiError ? e.message : "Erro ao carregar"));
  }, [id]);

  async function patch(body: { status?: string; notes?: string }, okMsg: string) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const d = await api.patch<{ item: Quiz }>(`/cms/admin/quiz-submissions/${id}`, body);
      setItem(d.item);
      onUpdated(d.item);
      setMsg(okMsg);
    } catch (e) {
      setErr(
        e instanceof ApiError ? `Não foi possível salvar: ${e.message}` : "Não foi possível salvar.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loadErr) return <Notice tone="error">{loadErr}</Notice>;
  if (!item) return <div className="text-sm text-muted-foreground">Carregando detalhe...</div>;

  const notesDirty = notes !== (item.notes ?? "");
  const answers = item.answers ?? {};
  const keys = Object.keys(answers).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""), 10);
    const nb = parseInt(b.replace(/\D/g, ""), 10);
    return (Number.isNaN(na) ? 1e9 : na) - (Number.isNaN(nb) ? 1e9 : nb);
  });

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{item.leadNome}</div>
          <div className="text-xs text-muted-foreground">Respondido em {fmtDate(item.createdAt)}</div>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-medium">Contato</h3>
          <DetailRow label="E-mail">
            <a className="text-primary underline" href={`mailto:${item.leadEmail}`}>
              {item.leadEmail}
            </a>
          </DetailRow>
          <DetailRow label="Telefone">{item.leadTelefone}</DetailRow>
          <DetailRow label="Empresa">{item.leadEmpresa}</DetailRow>
          <DetailRow label="Cargo">{item.leadCargo}</DetailRow>
          <DetailRow label="Equipamentos">{item.leadEquipamentos || "—"}</DetailRow>
          <DetailRow label="Fonte (utm_source)">{item.utmSource || "—"}</DetailRow>
          <DetailRow label="Meio (utm_medium)">{item.utmMedium || "—"}</DetailRow>
          <DetailRow label="Campanha (utm_campaign)">{item.utmCampaign || "—"}</DetailRow>
          <h3 className="mb-1 mt-4 text-sm font-medium">Resultado</h3>
          <DetailRow label="Pontuação">{item.score} de 80</DetailRow>
          <DetailRow label="Perfil">{profileLabel(item.profile)}</DetailRow>
          <DetailRow label="Primeiro contato">{fmtDate(item.contactedAt)}</DetailRow>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-medium">Respostas</h3>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Cada pergunta mostra a letra escolhida e os pontos dela (a = 0, b = 1, c = 2, d = 3, e =
            4). O texto das perguntas fica no quiz do site, não aparece aqui.
          </p>
          {keys.length === 0 && <p className="text-xs text-muted-foreground">Sem respostas.</p>}
          <div className="grid grid-cols-2 gap-x-4">
            {keys.map((k) => {
              const letter = String(answers[k] ?? "").toLowerCase();
              const pts = POINTS[letter];
              return (
                <div key={k} className="flex justify-between border-b py-1 text-sm">
                  <span className="text-muted-foreground">
                    Pergunta {k.replace(/\D/g, "") || k}
                  </span>
                  <span>
                    {letter ? letter.toUpperCase() : "—"}
                    {pts !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({pts} {pts === 1 ? "ponto" : "pontos"})
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">Situação</label>
          <select
            className={statusSelectCls}
            value={item.status}
            disabled={busy}
            onChange={(e) => patch({ status: e.target.value }, "Situação atualizada.")}
          >
            {!STATUSES.some((s) => s.value === item.status) && (
              <option value={item.status}>{item.status}</option>
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
              onClick={() => patch({ notes }, "Anotações salvas.")}
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
      </div>
    </div>
  );
}
