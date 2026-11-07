// Esquemas dos editores de conteúdo do site. Cada um descreve SÓ os campos que os
// componentes do site realmente leem (inova-institutional/src/components/*.tsx).
// Campos que o site não exibe (ex.: `partners[]` em team_partners) não aparecem,
// mas continuam guardados: o editor nunca apaga chaves desconhecidas.

import type { FieldDef, Option, Schema } from "@/components/structured/types";
import { ptText } from "@/lib/i18n";

const i18n = (key: string, label: string, extra: Partial<{ help: string; multiline: boolean; placeholder: string }> = {}): FieldDef => ({
  type: "i18n",
  key,
  label,
  ...extra,
});

const emptyI18n = () => ({ pt: "", en: null });

const highlightWarn = (value: unknown, parent: Record<string, unknown>) => {
  const h = ptText(value).trim();
  const t = ptText(parent.title).toLowerCase();
  if (h && !t.includes(h.toLowerCase())) {
    return "Este trecho não aparece dentro do título. Escreva-o igual ao que está no título para que ganhe destaque.";
  }
  return null;
};

const SOON = "Se deixar em branco, o site usa o texto padrão.";

export const AUTHORITY_ICONS: Option[] = [
  { value: "ShieldCheck", label: "Escudo (conformidade)" },
  { value: "Beaker", label: "Frasco de laboratório" },
  { value: "Gauge", label: "Medidor" },
  { value: "BookOpen", label: "Livro aberto" },
  { value: "Wrench", label: "Chave inglesa" },
  { value: "Award", label: "Medalha" },
];

export const RESULTS_ICONS: Option[] = [
  { value: "Brain", label: "Cérebro (inteligência artificial)" },
  { value: "Cpu", label: "Chip" },
  { value: "FlaskConical", label: "Frasco de ensaio" },
  { value: "Microscope", label: "Microscópio" },
  { value: "Stethoscope", label: "Estetoscópio (diagnóstico)" },
  { value: "GitBranch", label: "Ramificação" },
];

export const PROJECTS_ICONS: Option[] = [
  { value: "TrendingUp", label: "Seta subindo" },
  { value: "TrendingDown", label: "Seta descendo" },
  { value: "Clock", label: "Relógio" },
  { value: "Zap", label: "Raio" },
];

export const CTA_ICONS: Option[] = [
  { value: "Users", label: "Pessoas" },
  { value: "Sparkles", label: "Brilhos" },
  { value: "Bot", label: "Robô" },
];

export const SOCIAL_ICONS: Option[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
];

const buttonFields = (): FieldDef[] => [
  i18n("label", "Texto do botão"),
  { type: "link", key: "href", label: "Para onde o botão leva" },
];

export const heroSchema: Schema = [
  i18n("eyebrow", "Frase pequena acima do título", { help: SOON }),
  i18n("title", "Título principal", { help: SOON }),
  {
    ...i18n("titleHighlight", "Trecho do título em destaque (cor laranja)", {
      help: "Uma palavra ou frase que já esteja escrita no título.",
    }),
    warn: highlightWarn,
  },
  i18n("subtitle", "Texto de apoio abaixo do título", { multiline: true, help: SOON }),
  {
    type: "image",
    key: "backgroundImageUrl",
    label: "Imagem de fundo",
    help: "Se ficar vazia, o site usa a imagem padrão.",
  },
  {
    type: "variantItem",
    key: "ctas",
    variant: "primary",
    label: "Botão principal",
    fields: buttonFields(),
  },
  {
    type: "variantItem",
    key: "ctas",
    variant: "secondary",
    label: "Botão secundário",
    fields: buttonFields(),
  },
  {
    type: "list",
    key: "stats",
    label: "Números em destaque",
    help: "Faixa de números abaixo do título. O ideal são 4 itens. Itens sem valor ou sem descrição não aparecem.",
    itemLabel: "Número",
    addLabel: "Adicionar número",
    title: (it) => String((it as { value?: unknown })?.value ?? ""),
    item: {
      fields: [
        { type: "text", key: "value", label: "Valor (ex.: +73%, 24/7)" },
        i18n("label", "Descrição do número"),
      ],
    },
    newItem: () => ({ value: "", label: emptyI18n() }),
  },
];

export const authoritySchema: Schema = [
  i18n("eyebrow", "Frase pequena acima do título", { help: SOON }),
  i18n("title", "Título", { help: SOON }),
  {
    ...i18n("titleHighlight", "Trecho do título em destaque (cor laranja)", {
      help: "Uma frase que já esteja escrita no título.",
    }),
    warn: highlightWarn,
  },
  i18n("description", "Texto de apresentação", { multiline: true, help: SOON }),
  { type: "image", key: "portraitImageUrl", label: "Foto do especialista" },
  i18n("portraitName", "Nome ou título sob a foto"),
  i18n("portraitRole", "Cargo ou certificação sob a foto"),
  {
    type: "list",
    key: "pillars",
    label: "Pilares (quadros com ícone)",
    help: "O site mostra todos em duas colunas. O ideal são 6.",
    itemLabel: "Pilar",
    addLabel: "Adicionar pilar",
    title: (it) => ptText((it as { label?: unknown })?.label),
    item: {
      fields: [
        { type: "select", key: "icon", label: "Ícone", options: AUTHORITY_ICONS },
        i18n("label", "Título do pilar"),
        i18n("description", "Descrição", { multiline: true }),
      ],
    },
    newItem: () => ({ icon: "ShieldCheck", label: emptyI18n(), description: emptyI18n() }),
  },
  {
    type: "list",
    key: "keyMetrics",
    label: "Números-chave",
    help: "O ideal são 3 itens.",
    itemLabel: "Número",
    addLabel: "Adicionar número",
    title: (it) => String((it as { value?: unknown })?.value ?? ""),
    item: {
      fields: [
        { type: "text", key: "value", label: "Valor (ex.: +20, 100%)" },
        {
          type: "text",
          key: "suffix",
          label: "Complemento ao lado do valor (opcional)",
          help: "Ex.: anos, plantas.",
        },
        i18n("label", "Descrição"),
      ],
    },
    newItem: () => ({ value: "", suffix: "", label: emptyI18n() }),
  },
];

export const teamPartnersSchema: Schema = [
  i18n("eyebrow", "Frase pequena acima do texto", { help: SOON }),
  i18n("title", "Texto de chamada", { multiline: true, help: SOON }),
  {
    type: "image",
    key: "partnersImageUrl",
    label: "Imagem com os logos dos clientes",
    help: "O site mostra uma única imagem com todos os logos. Se ficar vazia, usa a imagem padrão.",
  },
];

export const resultsSchema: Schema = [
  i18n("eyebrow", "Frase pequena acima do título", { help: SOON }),
  i18n("title", "Título da seção", { help: SOON }),
  i18n("description", "Texto de apoio da seção", { multiline: true, help: SOON }),
  {
    type: "list",
    key: "cards",
    label: "Cartões de soluções",
    help: "O ideal são 3 cartões.",
    itemLabel: "Cartão",
    addLabel: "Adicionar cartão",
    title: (it) => ptText((it as { title?: unknown })?.title),
    item: {
      fields: [
        { type: "select", key: "icon", label: "Ícone", options: RESULTS_ICONS },
        i18n("title", "Título do cartão"),
        i18n("description", "Descrição", { multiline: true }),
        {
          type: "list",
          key: "bullets",
          label: "Tópicos do cartão",
          itemLabel: "Tópico",
          addLabel: "Adicionar tópico",
          item: { scalar: { type: "i18n", key: "", label: "Texto do tópico" } },
          newItem: () => emptyI18n(),
        },
        i18n("ctaLabel", "Texto do link do cartão"),
        { type: "link", key: "ctaHref", label: "Para onde o cartão leva" },
        {
          type: "image",
          key: "imageUrl",
          label: "Imagem de fundo do cartão",
          help: "Aparece bem suave ao passar o mouse.",
        },
      ],
    },
    newItem: () => ({
      icon: "Brain",
      title: emptyI18n(),
      description: emptyI18n(),
      bullets: [],
      ctaLabel: emptyI18n(),
      ctaHref: "",
      imageUrl: "",
    }),
  },
];

export const projectsSchema: Schema = [
  i18n("eyebrow", "Frase pequena acima do título", { help: SOON }),
  i18n("title", "Título do case em destaque", { multiline: true, help: SOON }),
  i18n("description", "Descrição", { multiline: true, help: SOON }),
  {
    type: "image",
    key: "imageUrl",
    label: "Imagem do case",
  },
  {
    type: "list",
    key: "kpis",
    label: "Resultados do case",
    help: "O primeiro resultado também aparece em destaque sobre a imagem.",
    itemLabel: "Resultado",
    addLabel: "Adicionar resultado",
    title: (it) => String((it as { value?: unknown })?.value ?? ""),
    item: {
      fields: [
        { type: "select", key: "icon", label: "Ícone", options: PROJECTS_ICONS },
        { type: "text", key: "value", label: "Valor (ex.: +73%, -42%)" },
        i18n("label", "Nome do resultado"),
        i18n("description", "Descrição curta", { multiline: true }),
      ],
    },
    newItem: () => ({
      icon: "TrendingUp",
      value: "",
      label: emptyI18n(),
      description: emptyI18n(),
    }),
  },
  {
    type: "variantItem",
    key: "ctas",
    variant: "primary",
    label: "Botão do case",
    help: "O site mostra só este botão.",
    fields: buttonFields(),
  },
];

export const ctaCardsSchema: Schema = [
  i18n("eyebrow", "Frase pequena acima do título", { help: SOON }),
  i18n("title", "Título da seção", { help: SOON }),
  i18n("description", "Texto de apoio", { multiline: true, help: SOON }),
  {
    type: "list",
    key: "cards",
    label: "Cartões de contato",
    help: "O ideal são 2 cartões. O primeiro aparece escuro e o segundo claro.",
    itemLabel: "Cartão",
    addLabel: "Adicionar cartão",
    title: (it) => ptText((it as { title?: unknown })?.title),
    item: {
      fields: [
        i18n("eyebrow", "Frase pequena do cartão"),
        { type: "select", key: "icon", label: "Ícone", options: CTA_ICONS },
        i18n("title", "Título do cartão"),
        i18n("description", "Descrição", { multiline: true }),
        {
          type: "list",
          key: "features",
          label: "Vantagens (lista com marcadores)",
          itemLabel: "Vantagem",
          addLabel: "Adicionar vantagem",
          item: { scalar: { type: "i18n", key: "", label: "Texto" } },
          newItem: () => emptyI18n(),
        },
        i18n("ctaLabel", "Texto do botão"),
        { type: "link", key: "ctaHref", label: "Para onde o botão leva" },
        { type: "image", key: "imageUrl", label: "Imagem do cartão" },
      ],
    },
    newItem: () => ({
      eyebrow: emptyI18n(),
      icon: "Users",
      title: emptyI18n(),
      description: emptyI18n(),
      features: [],
      ctaLabel: emptyI18n(),
      ctaHref: "",
      imageUrl: "",
    }),
  },
];

export const testimonialsSchema: Schema = [
  i18n("eyebrow", "Frase pequena acima do título", { help: SOON }),
  i18n("title", "Título da linha do tempo", { help: SOON }),
  i18n("description", "Texto de apoio", { multiline: true, help: SOON }),
  {
    type: "list",
    key: "milestones",
    label: "Marcos da história",
    help: "O ideal são 3 marcos.",
    itemLabel: "Marco",
    addLabel: "Adicionar marco",
    title: (it) => {
      const m = it as { year?: unknown; title?: unknown };
      return `${String(m?.year ?? "")} ${ptText(m?.title)}`.trim();
    },
    item: {
      fields: [
        { type: "text", key: "year", label: "Ano" },
        i18n("title", "Título do marco"),
        i18n("description", "Descrição", { multiline: true }),
        { type: "image", key: "imageUrl", label: "Imagem do marco" },
      ],
    },
    newItem: () => ({ year: "", title: emptyI18n(), description: emptyI18n(), imageUrl: "" }),
  },
];

export const footerSchema: Schema = [
  { type: "image", key: "logoUrl", label: "Logo do rodapé" },
  i18n("tagline", "Frase de apresentação", { multiline: true, help: SOON }),
  {
    type: "list",
    key: "columns",
    label: "Colunas de links",
    help: "Até 3 colunas ficam bem alinhadas.",
    itemLabel: "Coluna",
    addLabel: "Adicionar coluna",
    title: (it) => ptText((it as { title?: unknown })?.title),
    item: {
      fields: [
        i18n("title", "Título da coluna"),
        {
          type: "list",
          key: "links",
          label: "Links",
          itemLabel: "Link",
          addLabel: "Adicionar link",
          title: (it) => ptText((it as { label?: unknown })?.label),
          item: {
            fields: [
              i18n("label", "Texto do link"),
              { type: "link", key: "href", label: "Para onde o link leva" },
            ],
          },
          newItem: () => ({ label: emptyI18n(), href: "" }),
        },
      ],
    },
    newItem: () => ({ title: emptyI18n(), links: [] }),
  },
  {
    type: "group",
    key: "contact",
    label: "Contato",
    fields: [
      { type: "text", key: "email", label: "E-mail" },
      { type: "text", key: "phone", label: "Telefone" },
      i18n("address", "Endereço"),
    ],
  },
  {
    type: "list",
    key: "socials",
    label: "Redes sociais",
    itemLabel: "Rede social",
    addLabel: "Adicionar rede social",
    title: (it) => String((it as { icon?: unknown })?.icon ?? ""),
    emptyHint: "Nenhuma rede social: o rodapé não mostra ícones.",
    item: {
      fields: [
        { type: "select", key: "icon", label: "Rede", options: SOCIAL_ICONS },
        { type: "link", key: "href", label: "Endereço do perfil", help: "Ex.: https://instagram.com/inova" },
      ],
    },
    newItem: () => ({ icon: "instagram", href: "" }),
  },
  i18n("copyright", "Texto de direitos autorais"),
  {
    type: "group",
    key: "devCredit",
    label: "Crédito de desenvolvimento",
    fields: [
      i18n("text", "Texto (ex.: Desenvolvido por)"),
      { type: "image", key: "imageUrl", label: "Logo de quem desenvolveu" },
      { type: "link", key: "href", label: "Link do logo (opcional)" },
    ],
  },
];

export const navSchema: Schema = [
  {
    type: "list",
    key: "links",
    label: "Links do menu",
    help: "Aparecem na ordem abaixo. Se não houver nenhum, o site usa o menu atual.",
    itemLabel: "Link",
    addLabel: "Adicionar link",
    title: (it) => ptText((it as { label?: unknown })?.label),
    item: {
      fields: [
        i18n("label", "Texto do link"),
        { type: "link", key: "href", label: "Para onde o link leva" },
      ],
    },
    newItem: () => ({ label: emptyI18n(), href: "" }),
  },
  {
    type: "optionalGroup",
    key: "cta",
    label: "Botão de destaque do menu",
    toggleLabel: "Mostrar um botão de destaque no menu",
    create: () => ({ label: emptyI18n(), href: "" }),
    fields: [
      i18n("label", "Texto do botão"),
      { type: "link", key: "href", label: "Para onde o botão leva" },
    ],
  },
];

export type HomeSettingMeta = {
  key: string;
  label: string;
  description: string;
  schema: Schema;
};

export const HOME_SETTINGS: HomeSettingMeta[] = [
  {
    key: "hero",
    label: "Topo da página (Hero)",
    description: "Título principal, texto de apoio, botões e números em destaque.",
    schema: heroSchema,
  },
  {
    key: "authority",
    label: "Autoridade",
    description: "Apresentação da Inova, pilares e números-chave.",
    schema: authoritySchema,
  },
  {
    key: "team_partners",
    label: "Clientes e parceiros",
    description: "Texto de chamada e imagem com os logos.",
    schema: teamPartnersSchema,
  },
  {
    key: "results",
    label: "Soluções",
    description: "Os cartões de soluções (Inov.IA, análise, diagnóstico).",
    schema: resultsSchema,
  },
  {
    key: "projects_highlight",
    label: "Case em destaque",
    description: "O bloco grande com um case e seus resultados.",
    schema: projectsSchema,
  },
  {
    key: "cta_cards",
    label: "Cartões de contato",
    description: "Os dois caminhos para a primeira conversa.",
    schema: ctaCardsSchema,
  },
  {
    key: "testimonials",
    label: "Linha do tempo",
    description: "Marcos da história da empresa.",
    schema: testimonialsSchema,
  },
];
