"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MultiplierRow = { lossFactor: number; mtbfTarget: number };
type DefaultsRow = {
  ativosCriticos: number;
  horasAnoOperacao: number;
  mtbfMeses: number;
  custoParadaHora: number;
  consumoLubrificanteAno: number;
  nivelContaminacao: string;
};
type Config = {
  id: string;
  multipliers: Record<string, MultiplierRow>;
  defaults: Record<string, DefaultsRow>;
  genericDefaults: DefaultsRow;
  contaminationMultipliers: Record<string, number>;
  copy: Record<string, unknown>;
  updatedAt: string;
};

const SETOR_LABELS: Record<string, string> = {
  mineracao: "Mineração",
  "papel-celulose": "Papel & Celulose",
  cimento: "Cimento",
  alimentos: "Alimentos & Bebidas",
  siderurgia: "Siderurgia",
  "geracao-de-energia": "Geração de Energia",
};

const CONTAMINATION_LABELS: Record<string, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
};

export default function CalculadoraPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ config: Config }>("/cms/admin/calculator/config")
      .then((d) => setConfig(d.config))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function onSavedSection(updated: Config) {
    setConfig(updated);
  }

  return (
    <div>
      <PageHeader
        title="Calculadora"
        description="Configuração da calculadora de perdas. Mudanças aqui afetam imediatamente o resultado mostrado aos visitantes."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {config && (
        <div className="space-y-4">
          <MultipliersEditor config={config} onSaved={onSavedSection} />
          <ContaminationEditor config={config} onSaved={onSavedSection} />
          <DefaultsEditor config={config} onSaved={onSavedSection} />
          <CopyEditor config={config} onSaved={onSavedSection} />

          <div className="text-xs text-muted-foreground">
            Última atualização: {new Date(config.updatedAt).toLocaleString("pt-BR")}
          </div>
        </div>
      )}
    </div>
  );
}

async function saveSection(
  patch: Partial<Pick<Config, "multipliers" | "defaults" | "genericDefaults" | "contaminationMultipliers" | "copy">>,
): Promise<Config> {
  const data = await api.put<{ config: Config }>(
    "/cms/admin/calculator/config",
    patch,
  );
  return data.config;
}

// ============================================================
// Multipliers (por setor)
// ============================================================

function MultipliersEditor({
  config,
  onSaved,
}: {
  config: Config;
  onSaved: (c: Config) => void;
}) {
  const [draft, setDraft] = useState<Record<string, MultiplierRow>>(config.multipliers);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function update(setor: string, field: keyof MultiplierRow, value: number) {
    setDraft((prev) => ({ ...prev, [setor]: { ...prev[setor], [field]: value } }));
  }

  async function save() {
    setErr(null);
    setOk(false);
    setSaving(true);
    try {
      const updated = await saveSection({ multipliers: draft });
      onSaved(updated);
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
        <CardTitle className="text-base">Multiplicadores por setor</CardTitle>
        <CardDescription className="text-xs">
          `lossFactor`: multiplicador aplicado ao consumo. `mtbfTarget` (meses): meta usada na comparação MTBF atual vs ideal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Setor</th>
                <th className="px-3 py-2 text-right">Loss factor</th>
                <th className="px-3 py-2 text-right">MTBF target (meses)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(draft).map(([k, v]) => (
                <tr key={k} className="border-t">
                  <td className="px-3 py-2">{SETOR_LABELS[k] ?? k}</td>
                  <td className="px-3 py-2">
                    <NumberInput
                      value={v.lossFactor}
                      onChange={(n) => update(k, "lossFactor", n)}
                      step={0.01}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <NumberInput
                      value={v.mtbfTarget}
                      onChange={(n) => update(k, "mtbfTarget", n)}
                      step={1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionActions
          saving={saving}
          err={err}
          ok={ok}
          onSave={save}
          onRevert={() => setDraft(config.multipliers)}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================
// Contamination multipliers
// ============================================================

function ContaminationEditor({
  config,
  onSaved,
}: {
  config: Config;
  onSaved: (c: Config) => void;
}) {
  const [draft, setDraft] = useState<Record<string, number>>(config.contaminationMultipliers);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function save() {
    setErr(null);
    setOk(false);
    setSaving(true);
    try {
      const updated = await saveSection({ contaminationMultipliers: draft });
      onSaved(updated);
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
        <CardTitle className="text-base">Multiplicadores de contaminação</CardTitle>
        <CardDescription className="text-xs">
          Fator aplicado quando o usuário declara um nível de contaminação no equipamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.entries(draft).map(([k, v]) => (
            <div key={k} className="rounded border bg-muted/20 px-3 py-2">
              <div className="text-xs uppercase text-muted-foreground">
                {CONTAMINATION_LABELS[k] ?? k}
              </div>
              <NumberInput
                value={v}
                onChange={(n) => setDraft((prev) => ({ ...prev, [k]: n }))}
                step={0.01}
                className="mt-1 w-full text-right text-lg font-mono"
              />
            </div>
          ))}
        </div>
        <SectionActions
          saving={saving}
          err={err}
          ok={ok}
          onSave={save}
          onRevert={() => setDraft(config.contaminationMultipliers)}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================
// Defaults por setor
// ============================================================

const DEFAULTS_COLS: { key: keyof DefaultsRow; label: string; type: "number" | "text" }[] = [
  { key: "ativosCriticos", label: "Ativos críticos", type: "number" },
  { key: "horasAnoOperacao", label: "Horas/ano", type: "number" },
  { key: "mtbfMeses", label: "MTBF (meses)", type: "number" },
  { key: "custoParadaHora", label: "Custo parada/h (R$)", type: "number" },
  { key: "consumoLubrificanteAno", label: "Consumo lubrif. (L/ano)", type: "number" },
  { key: "nivelContaminacao", label: "Contaminação", type: "text" },
];

function DefaultsEditor({
  config,
  onSaved,
}: {
  config: Config;
  onSaved: (c: Config) => void;
}) {
  const [draft, setDraft] = useState<Record<string, DefaultsRow>>(config.defaults);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function update(setor: string, field: keyof DefaultsRow, value: string | number) {
    setDraft((prev) => ({
      ...prev,
      [setor]: { ...prev[setor], [field]: value },
    }));
  }

  async function save() {
    setErr(null);
    setOk(false);
    setSaving(true);
    try {
      const updated = await saveSection({ defaults: draft });
      onSaved(updated);
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
        <CardTitle className="text-base">
          Defaults por setor (quando o usuário responde &quot;Não sei&quot;)
        </CardTitle>
        <CardDescription className="text-xs">
          Valores médios usados quando o lead opta por não preencher campos técnicos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-left font-medium text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Setor</th>
                {DEFAULTS_COLS.map((c) => (
                  <th key={c.key} className="px-3 py-2">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {Object.entries(draft).map(([k, v]) => (
                <tr key={k} className="border-t">
                  <td className="px-3 py-2 font-sans">{SETOR_LABELS[k] ?? k}</td>
                  {DEFAULTS_COLS.map((c) => (
                    <td key={c.key} className="px-3 py-2">
                      {c.type === "number" ? (
                        <NumberInput
                          value={v[c.key] as number}
                          onChange={(n) => update(k, c.key, n)}
                          step={1}
                          className="w-28 text-right"
                        />
                      ) : (
                        <TextInput
                          value={v[c.key] as string}
                          onChange={(s) => update(k, c.key, s)}
                          className="w-24"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionActions
          saving={saving}
          err={err}
          ok={ok}
          onSave={save}
          onRevert={() => setDraft(config.defaults)}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================
// Copy (textos das etapas) — editor JSON
// ============================================================

function CopyEditor({
  config,
  onSaved,
}: {
  config: Config;
  onSaved: (c: Config) => void;
}) {
  const [text, setText] = useState(JSON.stringify(config.copy, null, 2));
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
      const updated = await saveSection({ copy: parsed });
      onSaved(updated);
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
        <CardTitle className="text-base">Textos das etapas (copy)</CardTitle>
        <CardDescription className="text-xs">
          Estrutura livre — títulos, subtítulos, labels de campos e mensagens da calculadora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
          spellCheck={false}
        />
        <SectionActions
          saving={saving}
          err={err}
          ok={ok}
          onSave={save}
          onRevert={() => setText(JSON.stringify(config.copy, null, 2))}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================
// Shared inputs / actions
// ============================================================

function NumberInput({
  value,
  onChange,
  step = 1,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (!Number.isNaN(n)) onChange(n);
      }}
      className={
        className ??
        "w-24 rounded border border-input bg-background px-2 py-1 text-right font-mono text-sm"
      }
    />
  );
}

function TextInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (s: string) => void;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        "rounded border border-input bg-background px-2 py-1 font-mono text-sm"
      }
    />
  );
}

function SectionActions({
  saving,
  err,
  ok,
  onSave,
  onRevert,
}: {
  saving: boolean;
  err: string | null;
  ok: boolean;
  onSave: () => void;
  onRevert: () => void;
}) {
  return (
    <>
      {err && (
        <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {err}
        </p>
      )}
      {ok && (
        <p className="mt-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
          Salvo.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Salvando…" : "Salvar"}
        </Button>
        <Button size="sm" variant="outline" onClick={onRevert}>
          Reverter
        </Button>
      </div>
    </>
  );
}
