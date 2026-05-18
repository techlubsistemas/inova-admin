# inova-admin

Painel administrativo da plataforma Inova. **Next.js 15 + Tailwind + shadcn/ui base + react-hook-form + zod**.

Consome a `inova-api` via HTTP. Roda em **http://localhost:3001**.

## Pré-requisito

A `inova-api` precisa estar rodando em `http://localhost:3344`. Veja o README dela.

## Como rodar pela primeira vez

```bash
cd inova-admin
npm install
# o .env.local já está configurado para apontar pra http://localhost:3344

npm run dev
```

Abre em **http://localhost:3001** — vai redirecionar para `/login`.

## Credenciais iniciais

As mesmas configuradas no seed da API (`.env` da `inova-api`):

- **Email:** `admin@inova.com`
- **Senha:** `inova123`

Troque depois pelo painel (rota `/dashboard/conta`, na Fase 6).

## O que já existe (Fase 1)

- `/login` — formulário de login com validação (Zod + react-hook-form)
- `/dashboard` — visão geral com cards-placeholder
- Sidebar com todos os módulos planejados (cases, artigos, glossário, setores, materiais, calculadora, leads, analytics, conta)
- Topbar com nome do admin + logout
- Middleware redireciona para `/login` se não houver token
- `me()` valida o token contra a API a cada carregamento

As páginas dos módulos (cases, artigos, etc.) ainda **não foram implementadas** — são entregas das Fases 2 a 6 do plano.

## Estrutura

```
inova-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # html + fonte
│   │   ├── page.tsx            # redireciona (login vs dashboard)
│   │   ├── login/page.tsx      # tela de login
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # sidebar + topbar + guard
│   │   │   └── page.tsx        # home do dashboard
│   │   └── globals.css         # tokens shadcn/tailwind
│   ├── components/
│   │   ├── ui/                 # primitivos shadcn (button, input, label, card)
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   ├── lib/
│   │   ├── api.ts              # cliente HTTP + login/logout/me
│   │   └── utils.ts            # cn() helper
│   └── middleware.ts           # proteção de /dashboard
├── tailwind.config.ts
├── postcss.config.mjs
└── package.json
```

## Variáveis de ambiente

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3344
```

Em produção, apontar para a URL pública da API.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | dev server em :3001 |
| `npm run build` | build de produção |
| `npm start` | roda build (:3001) |
| `npm run typecheck` | valida TypeScript |
| `npm run lint` | ESLint Next.js |

## Roadmap

Veja `docs/PLANO-BACKEND.md` no projeto `inova-institutional` para as próximas fases. O sidebar já mostra a estrutura final dos módulos.
