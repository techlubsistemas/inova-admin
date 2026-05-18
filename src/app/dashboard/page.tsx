import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Leads novos (24h)", value: "0", hint: "Conectar na Fase 4" },
  { label: "Visitas hoje", value: "—", hint: "Conectar na Fase 5" },
  { label: "Cases publicados", value: "3", hint: "Já vindo do seed" },
  { label: "Artigos publicados", value: "16", hint: "Já vindo do seed" },
];

const nextSteps = [
  {
    title: "Fase 2 — CMS das coleções",
    description:
      "Habilitar CRUD para Cases, Artigos, Glossário e Setores no painel.",
  },
  {
    title: "Fase 3 — Seções fixas",
    description:
      "Editor visual de Hero, Authority, Footer e demais seções da home.",
  },
  {
    title: "Fase 4 — Calculadora + Leads",
    description:
      "Ajustar gate (Nome/Tel/Email obrigatórios), captura real e tabela de leads.",
  },
  {
    title: "Fase 5 — Analytics próprio",
    description: "Tracker, eventos e dashboards de visitas e funil.",
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo</h1>
        <p className="text-sm text-muted-foreground">
          Painel administrativo Inova — Fase 1 concluída.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-2 text-3xl font-semibold">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas fases</CardTitle>
          <CardDescription>
            O backend, o banco e o seed estão prontos. Daqui pra frente é
            ligar uma tela do admin de cada vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextSteps.map((s, i) => (
            <div key={s.title} className="flex gap-4">
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 2}
              </div>
              <div>
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-sm text-muted-foreground">
                  {s.description}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
