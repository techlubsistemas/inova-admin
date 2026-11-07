/**
 * Taxonomia usada no painel (categorias, setores, equipamentos, problemas).
 *
 * ESPELHA `inova-institutional/src/lib/taxonomy.ts` (a fonte da verdade, usada
 * também em `inova-api/prisma/seed-data/taxonomy.ts`). Se o site ganhar ou
 * perder um valor, atualize este arquivo igualmente.
 */

export type Taxonomy = Readonly<Record<string, string>>;

export const SETORES = {
  mineracao: "Mineração",
  "papel-celulose": "Papel & Celulose",
  cimento: "Cimento",
  alimentos: "Alimentos & Bebidas",
  siderurgia: "Siderurgia",
  "geracao-de-energia": "Geração de Energia",
} as const;

export const EQUIPAMENTOS = {
  redutor: "Redutor",
  compressor: "Compressor",
  turbina: "Turbina",
  mancal: "Mancal",
  bomba: "Bomba",
  motor: "Motor elétrico",
  prensa: "Prensa",
} as const;

export const PROBLEMAS = {
  contaminacao: "Contaminação",
  desgaste: "Desgaste prematuro",
  "falha-viscosidade": "Falha de viscosidade",
  oxidacao: "Oxidação do lubrificante",
  "selecao-incorreta": "Seleção incorreta",
  "programa-inexistente": "Programa inexistente",
} as const;

export const CATEGORIAS_BLOG = {
  normas: "Normas & ISO",
  analise: "Análise técnica",
  manutencao: "Manutenção preditiva",
  selecao: "Seleção de lubrificantes",
  "estudos-de-caso": "Estudos de caso",
} as const;

export const CATEGORIAS_GLOSSARIO = {
  medicao: "Medição",
  tecnica: "Técnica",
  certificacao: "Certificação",
  equipamento: "Equipamento",
  norma: "Norma",
} as const;

export function labelOf(map: Taxonomy, value: string | null | undefined): string {
  if (!value) return "—";
  return map[value] ?? value;
}
