"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Config = {
  id: string;
  multipliers: Record<string, { lossFactor: number; mtbfTarget: number }>;
  defaults: Record<
    string,
    {
      ativosCriticos: number;
      horasAnoOperacao: number;
      mtbfMeses: number;
      custoParadaHora: number;
      consumoLubrificanteAno: number;
      nivelContaminacao: string;
    }
  >;
  contaminationMultipliers: Record<string, number>;
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

export default function CalculadoraPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ config: Config }>("/admin/calculator/config")
      .then((d) => setConfig(d.config))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Calculadora"
        description="Configuração técnica da calculadora de perdas. Edição entra na Fase 4."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {config && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Multiplicadores por setor</CardTitle>
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
                    {Object.entries(config.multipliers).map(([k, v]) => (
                      <tr key={k} className="border-t">
                        <td className="px-3 py-2">{SETOR_LABELS[k] ?? k}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {v.lossFactor}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {v.mtbfTarget}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Multiplicadores de contaminação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {Object.entries(config.contaminationMultipliers).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded border bg-muted/20 px-3 py-2"
                  >
                    <div className="text-xs uppercase text-muted-foreground">{k}</div>
                    <div className="mt-1 font-mono text-lg">{v}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Defaults por setor (quando o usuário responde "Não sei")
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-left font-medium text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Setor</th>
                      <th className="px-3 py-2">Ativos críticos</th>
                      <th className="px-3 py-2">Horas/ano</th>
                      <th className="px-3 py-2">MTBF (m)</th>
                      <th className="px-3 py-2">Custo parada/h (R$)</th>
                      <th className="px-3 py-2">Consumo lubrif. (L/ano)</th>
                      <th className="px-3 py-2">Contaminação</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {Object.entries(config.defaults).map(([k, v]) => (
                      <tr key={k} className="border-t">
                        <td className="px-3 py-2 font-sans">{SETOR_LABELS[k] ?? k}</td>
                        <td className="px-3 py-2 text-right">{v.ativosCriticos}</td>
                        <td className="px-3 py-2 text-right">{v.horasAnoOperacao}</td>
                        <td className="px-3 py-2 text-right">{v.mtbfMeses}</td>
                        <td className="px-3 py-2 text-right">
                          {v.custoParadaHora.toLocaleString("pt-BR")}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {v.consumoLubrificanteAno.toLocaleString("pt-BR")}
                        </td>
                        <td className="px-3 py-2 text-right font-sans">
                          {v.nivelContaminacao}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            Última atualização: {new Date(config.updatedAt).toLocaleString("pt-BR")}
          </div>
        </div>
      )}

      <div className="mt-8">
        <ComingSoon
          fase="Fase 4"
          description="Editar multiplicadores/defaults por setor, textos das etapas (copy), preview ao vivo do cálculo enquanto edita, e migrar o gate para Nome+Tel+Email obrigatórios."
        />
      </div>
    </div>
  );
}
