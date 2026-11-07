/**
 * Aulas em vídeo do painel. Lista fixa: para acrescentar uma aula, inclua aqui e publique
 * o arquivo `<id>.mp4` no endereço de NEXT_PUBLIC_AULAS_URL.
 */
export type Aula = {
  id: string;
  titulo: string;
  descricao: string;
};

export const AULAS: Aula[] = [
  {
    id: "inova-painel-01-entrar",
    titulo: "Entrar e conhecer o painel",
    descricao: "Como entrar, o que há na Visão geral e para que serve cada parte do menu.",
  },
  {
    id: "inova-painel-home-previa",
    titulo: "Editar a home e pré-visualizar antes de publicar",
    descricao: "Troque um texto da página inicial e confira o resultado antes de salvar.",
  },
  {
    id: "inova-painel-03-imagens",
    titulo: "Trocar imagens",
    descricao: "Envie uma imagem nova e veja quais formatos e tamanhos o painel aceita.",
  },
  {
    id: "inova-painel-04-menu-rodape",
    titulo: "Alterar o menu e o rodapé",
    descricao: "Edite os links do topo e as colunas, o contato e as redes do rodapé.",
  },
  {
    id: "inova-painel-05-artigo",
    titulo: "Publicar um artigo",
    descricao: "Escreva um artigo novo para o blog, do rascunho à publicação.",
  },
  {
    id: "inova-painel-06-colecoes",
    titulo: "Cuidar de cases, setores e glossário",
    descricao: "Atualize as listas de cases, setores industriais e termos do glossário.",
  },
  {
    id: "inova-painel-07-seo",
    titulo: "Ajustar o SEO",
    descricao: "Mude o título, a descrição e a imagem de cada página nos resultados de busca.",
  },
  {
    id: "inova-painel-08-leads",
    titulo: "Acompanhar leads e ativar avisos",
    descricao: "Filtre os contatos, mude a situação, baixe a lista e receba avisos por e-mail.",
  },
  {
    id: "inova-painel-09-calculadora",
    titulo: "Ajustar a calculadora",
    descricao: "Altere os fatores, os pesos e os textos da calculadora de perdas.",
  },
  {
    id: "inova-painel-10-formulario",
    titulo: "Criar um formulário",
    descricao: "Monte um formulário, publique a página dele e veja os envios.",
  },
];

/** Onde os vídeos ficam. Opcional: sem a variável, usa a pasta public/aulas do painel. */
const AULAS_URL = (process.env.NEXT_PUBLIC_AULAS_URL || "/aulas").replace(/\/+$/, "");

export function aulaUrl(id: string) {
  return `${AULAS_URL}/${id}.mp4`;
}
