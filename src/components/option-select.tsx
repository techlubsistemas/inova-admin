"use client";

import type { Option } from "@/components/structured/types";
import type { Taxonomy } from "@/lib/taxonomy";

export const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function taxonomyOptions(map: Taxonomy): Option[] {
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}

/**
 * Seleção a partir de uma lista. Se o valor atual não está na lista, ele
 * continua aparecendo (nunca em branco nem apagado), com um aviso.
 */
export function OptionSelect({
  id,
  value,
  onChange,
  options,
  emptyLabel = "Selecione…",
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  emptyLabel?: string;
  disabled?: boolean;
}) {
  const known = options.some((o) => o.value === value);
  const outside = value !== "" && !known;
  return (
    <div className="space-y-1">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={selectCls}
      >
        <option value="">{emptyLabel}</option>
        {outside && <option value={value}>{value} (fora da lista)</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {outside && (
        <p className="rounded border border-yellow-300 bg-yellow-50 px-2 py-1 text-[11px] text-yellow-900">
          O valor atual (&quot;{value}&quot;) não está na lista que o site conhece. Ele foi
          mantido como está. Escolha outra opção só se quiser trocar.
        </p>
      )}
    </div>
  );
}
