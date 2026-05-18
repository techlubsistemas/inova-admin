// Visualizador leve para o JSON estruturado de SiteSetting/PageMetadata.
// Modo leitura (Fase 1). Edição via TipTap/forms entra nas próximas fases.

import { tx } from "@/lib/i18n";

type Value = unknown;

export function JsonPreview({ value }: { value: Value }) {
  return <div className="space-y-2">{render(value)}</div>;
}

function render(value: Value, depth = 0): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  // i18n field { pt, en }
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null &&
    "pt" in value &&
    (typeof (value as { pt: unknown }).pt === "string" ||
      (value as { pt: unknown }).pt === null)
  ) {
    return (
      <div className="space-y-0.5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          pt
        </div>
        <div className="text-sm">{tx(value as { pt: string; en: string | null })}</div>
        {(value as { en: string | null }).en && (
          <>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              en
            </div>
            <div className="text-sm text-foreground/70">
              {(value as { en: string }).en}
            </div>
          </>
        )}
      </div>
    );
  }

  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="text-sm">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div
            key={i}
            className="rounded border border-border/50 bg-muted/20 p-2"
          >
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Item {i + 1}
            </div>
            {render(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(value as Record<string, Value>).map(([k, v]) => (
          <div key={k} className="space-y-1">
            <div className="text-xs font-medium capitalize text-foreground/80">
              {k}
            </div>
            <div className="pl-2">{render(v, depth + 1)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm">{String(value)}</span>;
}
