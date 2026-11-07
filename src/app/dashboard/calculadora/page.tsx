"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SETORES } from "@/lib/taxonomy";
import { PageHeader } from "@/components/page-header";
import { Notice } from "@/components/structured/ui";
import { ContaminationCard } from "@/components/calculator/contamination-card";
import { CopyCard } from "@/components/calculator/copy-card";
import { GridCard, type GridCol, type GridRow } from "@/components/calculator/grid-card";
import {
  CONTAMINACAO,
  asObj,
  saveCalcConfig,
  type CalcConfig,
} from "@/components/calculator/shared";

const MULT_COLS: GridCol[] = [
  {
    key: "lossFactor",
    label: "Fator de perda",
    help: "Multiplica a perda (1 = neutro)",
    kind: "number",
    rule: { positive: true, max: 100 },
  },
  {
    key: "mtbfTarget",
    label: "Meta de MTBF (meses)",
    help: "Tempo médio entre falhas ideal",
    kind: "number",
    rule: { positive: true, max: 1000 },
  },
];

const DEFAULT_COLS: GridCol[] = [
  { key: "ativosCriticos", label: "Ativos críticos", kind: "number", rule: { integer: true, min: 1, max: 100000 } },
  { key: "horasAnoOperacao", label: "Horas de operação por ano", kind: "number", rule: { min: 1, max: 8784 } },
  { key: "mtbfMeses", label: "MTBF (meses)", kind: "number", rule: { min: 1, max: 1000 } },
  { key: "custoParadaHora", label: "Custo da parada por hora (R$)", kind: "number", rule: { min: 1, max: 1e9 } },
  { key: "consumoLubrificanteAno", label: "Consumo de lubrificante (L/ano)", kind: "number", rule: { min: 1, max: 1e9 } },
  { key: "nivelContaminacao", label: "Nível de contaminação", kind: "select", options: CONTAMINACAO },
];

const GENERIC_ID = "__generic__";

/** Linhas: os setores do site e, depois, qualquer outro setor que já exista no banco. */
function sectorRows(record: Record<string, unknown>): GridRow[] {
  const ids = [...Object.keys(SETORES), ...Object.keys(record).filter((k) => !(k in SETORES))];
  return ids.map((id) => ({
    id,
    label: (SETORES as Record<string, string>)[id] ?? `${id} (fora da lista)`,
    source: asObj(record[id]),
  }));
}

export default function CalculadoraPage() {
  const [config, setConfig] = useState<CalcConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Mantém a última versão gravada, para os cartões enviarem só a parte que mudaram
  // sobre os dados mais recentes (sem recriar a tela).
  const [latest, setLatest] = useState<CalcConfig | null>(null);

  useEffect(() => {
    api
      .get<{ config: CalcConfig | null }>("/cms/admin/calculator/config")
      .then((d) => {
        setConfig(d.config);
        setLatest(d.config);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const base = {
    multipliers: asObj(latest?.multipliers),
    defaults: asObj(latest?.defaults),
    genericDefaults: asObj(latest?.genericDefaults),
    contaminationMultipliers: asObj(latest?.contaminationMultipliers),
    copy: asObj(latest?.copy),
  };

  return (
    <div>
      <PageHeader
        title="Calculadora"
        description="Números e textos da calculadora de perdas do site. O site usa estes valores (em produção, até 60 segundos depois de salvar); o que ficar em branco usa o valor que já vem no código."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <Notice tone="error">{error}</Notice>}

      {!loading && !error && config === null && (
        <div className="mb-4">
          <Notice tone="warning">
            Ainda não existe configuração da calculadora no banco (talvez o conteúdo inicial não
            tenha sido carregado). Enquanto isso, o site usa os valores do código. Ao salvar uma
            das seções abaixo, a configuração é criada e o site passa a usar o que você preencher,
            campo a campo.
          </Notice>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <GridCard
            title="Fatores por setor"
            description="Fator de perda: quanto maior, maior a perda estimada para o setor. Meta de MTBF: o tempo ideal entre falhas, usado na comparação com o tempo atual."
            rows={sectorRows(base.multipliers)}
            cols={MULT_COLS}
            onSave={async (merged) => {
              const updated = await saveCalcConfig({
                multipliers: { ...base.multipliers, ...merged },
              });
              setLatest(updated);
            }}
          />

          <ContaminationCard
            original={base.contaminationMultipliers}
            onSaved={setLatest}
          />

          <GridCard
            title="Valores usados quando a pessoa responde “Não sei”"
            description="Valores médios que a calculadora assume quando o visitante não sabe um dado. A última linha vale quando nenhum setor foi escolhido."
            rows={[
              ...sectorRows(base.defaults),
              { id: GENERIC_ID, label: "Qualquer outro caso (genérico)", source: base.genericDefaults },
            ]}
            cols={DEFAULT_COLS}
            onSave={async (merged) => {
              const { [GENERIC_ID]: generic, ...bySector } = merged;
              const updated = await saveCalcConfig({
                defaults: { ...base.defaults, ...bySector },
                genericDefaults: generic,
              });
              setLatest(updated);
            }}
          />

          <CopyCard original={base.copy} onSaved={setLatest} />

          {latest && (
            <div className="text-xs text-muted-foreground">
              Última atualização: {new Date(latest.updatedAt).toLocaleString("pt-BR")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
