"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { CalculatorLeads } from "@/components/leads/calculator-leads";
import { QuizLeads } from "@/components/leads/quiz-leads";
import { LeadNotifications } from "@/components/leads/notifications";

const TABS = [
  { id: "calc", label: "Calculadora" },
  { id: "quiz", label: "Diagnóstico (quiz)" },
  { id: "avisos", label: "Avisos por e-mail" },
] as const;

export default function LeadsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("calc");

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Pessoas que deixaram contato na calculadora ou no diagnóstico (quiz) do site."
      />
      <div className="mb-4 flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              tab === t.id
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "calc" && <CalculatorLeads />}
      {tab === "quiz" && <QuizLeads />}
      {tab === "avisos" && <LeadNotifications />}
    </div>
  );
}
