# inova-admin

CMS administrativo (Next.js + shadcn/ui) do ecossistema Inova — gerencia
conteúdo do site institucional.

## Documentação

Toda a documentação do sistema vive em **[inova-docs](../inova-docs/)**.

- [Visão geral do sistema](../inova-docs/systems/admin-cms.md)
- [Setup local](../inova-docs/guides/developer/local-setup.md)

## Comandos rápidos

```bash
npm install
npm run dev
```

O painel roda na porta **3001** (`npm run dev`).

## Variáveis de ambiente

- `NEXT_PUBLIC_API_URL`: endereço da API (ex.: `http://localhost:3333`).
- `NEXT_PUBLIC_SITE_URL` (opcional): endereço público do site, usado nos botões
  "Pré-visualizar" e nos links dos formulários. Sem ela, usa
  `https://www.inovaengenharia.net.br`.
