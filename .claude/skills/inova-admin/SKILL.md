---
name: inova-admin
description: Painel administrativo Next.js + Tailwind + shadcn primitives da plataforma Inova Lubrificantes. Invocar com `/inova-admin` ao trabalhar em qualquer arquivo dentro de `inova-admin/` — formulários, listagens, componentes UI, fluxo de auth, chamadas à API. Cobre stack, convenções, fetch, design tokens.
---

# Inova Admin — Skill

Painel administrativo da plataforma Inova. Consome a `inova-api` via HTTP.

## ⚠️ OBRIGATÓRIO antes de codar

Leia o documento vivo do projeto:
`📲 G14 · INOVA APP (LEGADO)/HISTORICO-E-PROXIMOS-PASSOS.md`

Lá estão decisões, histórico e pendências em aberto. **Ao final da sessão, atualize**
(adicione entrada cronológica + marque pendências resolvidas; nunca apague).

## Stack confirmada (não trocar sem conversar)

- **Next.js 15 App Router** (mesma versão do site institucional)
- **React 19 RC** (sim, é a versão da family do Next 15)
- **Tailwind CSS 3** + design tokens shadcn em `globals.css` (CSS custom properties HSL)
- **shadcn/ui** instalado como código próprio em `src/components/ui/` (não como pacote)
- **react-hook-form + zod + @hookform/resolvers** para forms
- **@tanstack/react-query** (disponível, ainda não em uso — usar a partir da Fase 2)
- **lucide-react** para ícones
- **`@radix-ui/*`** primitives sob shadcn (label, slot)

## Estado da plataforma

Veja `inova-platform.md` na raiz para mapa dos 3 projetos.

## Variáveis críticas

| Item | Valor dev |
|---|---|
| Porta admin | `3001` (não 3000 — site institucional usa 3000) |
| API URL | `process.env.NEXT_PUBLIC_API_URL` → `http://localhost:3344` |
| Cookie do JWT | `inova_admin_token` (compartilhado com o helper `api.ts`) |
| Login inicial | `admin@inova.com / inova123` |

## Comandos

```bash
npm run dev          # :3001 com hot reload
npm run build        # build produção
npm start            # roda build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

## Estrutura

```
inova-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # html lang=pt-BR + font Inter
│   │   ├── page.tsx                # /  redireciona login ou /dashboard
│   │   ├── login/page.tsx          # form de login
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # guard + sidebar + topbar
│   │   │   └── page.tsx            # home do dashboard
│   │   └── globals.css             # design tokens shadcn (CSS vars HSL)
│   ├── components/
│   │   ├── ui/                     # primitivos shadcn (button, input, label, card)
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   ├── lib/
│   │   ├── api.ts                  # cliente fetch + login/logout/me
│   │   └── utils.ts                # cn() helper
│   └── middleware.ts               # redireciona /dashboard sem token
├── tailwind.config.ts
└── postcss.config.mjs
```

## Padrão de fetch — sempre via `src/lib/api.ts`

```ts
import { api } from "@/lib/api";

const cases = await api.get<Case[]>("/admin/cases");
await api.post("/admin/cases", { slug, ... });
await api.put<Case>(`/admin/cases/${id}`, payload);
await api.delete(`/admin/cases/${id}`);
```

- O cliente injeta `Authorization: Bearer <token>` automaticamente lendo o cookie.
- `ApiError` é lançado em respostas não-OK, com `status` e `details`.
- Para chamadas sem auth (ex: rotas públicas se precisar), passar `{ auth: false }`.

## Padrão de auth no admin

- Login: form usa `react-hook-form + zod`, chama `login(email, password)` do `api.ts`.
- `login()` salva o token em cookie (samesite=lax, max-age=7d).
- Middleware do Next (`src/middleware.ts`) redireciona `/dashboard/*` sem token para `/login`.
- `app/dashboard/layout.tsx` chama `me()` no mount; se falhar, limpa cookie e redireciona.
- Logout: `logout()` chama API + limpa cookie + `router.replace("/login")`.

## Cores e design

Tema shadcn padrão com primary laranja da Inova (`#ED6842` ≈ `hsl(17 84% 56%)`).
Tokens em CSS vars no `globals.css`. Para mudar cor primária, mexer em `--primary`.

NÃO inventar cores novas em componentes — sempre usar:
- `text-foreground / text-muted-foreground`
- `bg-background / bg-card / bg-muted`
- `border-border`
- `bg-primary text-primary-foreground`
- `bg-destructive` para erros
- Cards: `<Card>...<CardHeader>...<CardContent>...`

## Como adicionar uma página de módulo (Fase 2+)

Exemplo: rota `/dashboard/cases` (listagem) + `/dashboard/cases/[id]` (edição).

1. Criar `src/app/dashboard/cases/page.tsx` (listagem usando TanStack Query)
2. Criar `src/app/dashboard/cases/[id]/page.tsx` (form usando react-hook-form)
3. Criar `src/app/dashboard/cases/novo/page.tsx` (form vazio)
4. Item da sidebar já existe em `components/sidebar.tsx` — só precisa estar com `href` correto.
5. Para forms, validar com schema Zod **importado da API ou duplicado** (a API tem seus schemas em `inova-api/src/modules/.../schemas.ts`; copiar enquanto não tivermos pacote shared).

## Convenções de form

```tsx
const schema = z.object({ ... });
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

async function onSubmit(data: FormData) {
  try {
    await api.post("/admin/...", data);
    router.push("/dashboard/...");
  } catch (err) {
    if (err instanceof ApiError) {
      setServerError(err.message);
      // err.details tem field-level errors do Zod backend
    }
  }
}
```

## Padrão de campos i18n (Fase 2+)

Campos PT/EN no DB vêm como `{ pt: string, en: string | null }`. Na UI:

- Mostrar tabs "Português / Inglês" no form
- PT é obrigatório
- EN é opcional — placeholder "Deixe vazio para usar o português"
- No save, montar `{ pt: ptValue, en: enValue || null }`

## Gotchas conhecidos

1. **React 19 RC**: alguns libs ainda têm bugs. Se algum componente reclamar, checar peer deps. shadcn primitives já testados.
2. **Cookie não-HTTP-only** intencionalmente — o middleware do Next precisa ler. Em prod sob HTTPS, ainda é seguro com `samesite=lax`.
3. **Server Components vs Client**: forms e fetches autenticados precisam ser `"use client"`. Páginas de listagem podem usar server fetch se preferir, mas Query simplifica refresh.
4. **App Router + middleware**: protege apenas pelo cookie. Validação real do JWT é feita no `me()` chamado pelo layout no client.
5. **Tailwind classes dinâmicas**: usar `cn()` sempre. Strings interpoladas (`bg-${x}`) NÃO funcionam — Tailwind purge não detecta.
6. **shadcn novos componentes**: adicionar manualmente em `src/components/ui/` copiando da documentação shadcn. Não tem CLI configurado (intencional — controle total do código).

## Quando o usuário pedir uma nova feature

Sempre conferir:
1. A API tem endpoint? Se não, adicionar em `inova-api` primeiro.
2. O Zod schema da API e o do front estão alinhados?
3. O item da sidebar aponta certo?
4. Layout protegido (`/dashboard/*`) ou público?
5. Forma de validação de erro: `ApiError.details` carrega erros de campo do backend.

## Estado/roadmap

- Fase 1 ✅ Login + dashboard placeholder
- Fase 2: CRUDs de cases, articles, glossário, setores (próxima)
- Fase 3: Editor das seções fixas (Hero, Footer, etc.) + SEO + páginas legais
- Fase 4: Materiais (upload PDF) + leads + editor da calculadora
- Fase 5: Dashboards de analytics (usar Recharts)
- Fase 6: i18n EN ativo + polimento + deploy Vercel
