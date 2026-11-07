"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldCls, Notice } from "./ui";

/**
 * "Modo avançado (JSON)": recolhido por padrão. Mostra o valor atual e permite
 * colar/editar o JSON. Só é aplicado se for válido (objeto) e o usuário confirmar.
 */
export function AdvancedJson({
  value,
  onApply,
  hint,
}: {
  value: unknown;
  onApply: (next: Record<string, unknown>) => void;
  hint?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const current = JSON.stringify(value ?? {}, null, 2);
  const text = draft ?? current;

  let error: string | null = null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      error = "O conteúdo precisa ser um objeto JSON (começando com { e terminando com }).";
    }
  } catch (e) {
    error = `JSON inválido: ${e instanceof Error ? e.message : "erro de sintaxe"}`;
  }

  return (
    <details className="rounded-md border bg-muted/20">
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground">
        Modo avançado (JSON)
      </summary>
      <div className="space-y-2 p-3">
        <p className="text-[11px] text-muted-foreground">
          {hint ??
            "Para quem conhece o formato. O texto abaixo é o conteúdo completo, inclusive campos que o painel não mostra. Depois de aplicar, clique em Salvar."}
        </p>
        <textarea
          value={text}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          spellCheck={false}
          className={`${fieldCls} font-mono text-xs`}
        />
        {draft !== null && error && <Notice tone="error">{error}</Notice>}
        {draft !== null && !error && (
          <Notice tone="info">JSON válido. Clique em &quot;Aplicar JSON&quot; para usar.</Notice>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={draft === null || !!error}
            onClick={() => {
              onApply(parsed as Record<string, unknown>);
              setDraft(null);
            }}
          >
            Aplicar JSON
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={draft === null}
            onClick={() => setDraft(null)}
          >
            Descartar edição do JSON
          </Button>
        </div>
      </div>
    </details>
  );
}
