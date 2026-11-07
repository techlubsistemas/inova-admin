"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const fieldCls =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

/** Rótulo + campo + ajuda + aviso. */
export function FieldShell({
  label,
  help,
  warning,
  htmlFor,
  badge,
  children,
}: {
  label: string;
  help?: string;
  warning?: string | null;
  htmlFor?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {badge}
      </div>
      {children}
      {help && <p className="text-[11px] text-muted-foreground">{help}</p>}
      {warning && (
        <p className="rounded border border-yellow-300 bg-yellow-50 px-2 py-1 text-[11px] text-yellow-900">
          {warning}
        </p>
      )}
    </div>
  );
}

export function EnBadge() {
  return (
    <span
      title="Existe uma tradução em inglês guardada. Ela é mantida ao salvar."
      className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
    >
      EN guardado
    </span>
  );
}

/** Caixa de um item de lista, com mover para cima/baixo e remover. */
export function ItemShell({
  title,
  index,
  count,
  onMove,
  onRemove,
  canRemove = true,
  children,
}: {
  title: string;
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  canRemove?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/20">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
        <div className="truncate text-xs font-medium text-muted-foreground">
          {index + 1}. {title}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
            aria-label="Mover para cima"
            title="Mover para cima"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
            aria-label="Mover para baixo"
            title="Mover para baixo"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-destructive hover:text-destructive"
            disabled={!canRemove}
            onClick={onRemove}
            aria-label="Remover"
            title="Remover"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="space-y-3 p-3">{children}</div>
    </div>
  );
}

export function AddButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={onClick} disabled={disabled}>
      <Plus className="mr-1 h-3 w-3" />
      {label}
    </Button>
  );
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return arr;
  const copy = [...arr];
  const [it] = copy.splice(from, 1);
  copy.splice(to, 0, it);
  return copy;
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
}) {
  const cls = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    warning: "border-yellow-300 bg-yellow-50 text-yellow-900",
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    success: "border-green-300 bg-green-50 text-green-900",
  }[tone];
  return <div className={`rounded-md border px-3 py-2 text-xs ${cls}`}>{children}</div>;
}
