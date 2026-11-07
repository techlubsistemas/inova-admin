"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { AULAS, aulaUrl } from "@/lib/aulas";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Notice } from "@/components/structured/ui";
import { Card, CardContent } from "@/components/ui/card";

export default function AulasPage() {
  const [atualId, setAtualId] = useState(AULAS[0].id);
  const [semVideo, setSemVideo] = useState<Record<string, boolean>>({});
  const atual = AULAS.find((a) => a.id === atualId) ?? AULAS[0];

  return (
    <div>
      <PageHeader
        title="Aulas"
        description="Vídeos curtos que mostram, passo a passo, como cuidar do site por este painel."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          {semVideo[atual.id] ? (
            <Notice tone="warning">Este vídeo ainda não está disponível.</Notice>
          ) : (
            <video
              key={atual.id}
              src={aulaUrl(atual.id)}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-lg border bg-black"
              onError={() => setSemVideo((s) => ({ ...s, [atual.id]: true }))}
            />
          )}
          <div>
            <h2 className="text-lg font-semibold">{atual.titulo}</h2>
            <p className="text-sm text-muted-foreground">{atual.descricao}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-2">
            <ol className="space-y-1">
              {AULAS.map((aula, i) => (
                <li key={aula.id}>
                  <button
                    type="button"
                    aria-current={aula.id === atual.id ? "true" : undefined}
                    onClick={() => setAtualId(aula.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      aula.id === atual.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted",
                    )}
                  >
                    <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {i + 1}. {aula.titulo}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
