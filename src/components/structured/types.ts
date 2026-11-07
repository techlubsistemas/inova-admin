// Esquema do editor estruturado: descreve os campos em português simples.
// O editor altera o valor ORIGINAL no lugar (só o que o usuário mexe), então
// chaves desconhecidas e traduções em inglês (`en`) ficam intactas.

export type Option = { value: string; label: string };

type Base = {
  /** Nome da chave no objeto. Em itens de lista simples (texto), use "". */
  key: string;
  label: string;
  /** Explicação curta, em português simples, abaixo do campo. */
  help?: string;
  /** Devolve um aviso (não bloqueia) a partir do valor do campo e do objeto pai. */
  warn?: (value: unknown, parent: Record<string, unknown>) => string | null;
};

export type FieldDef =
  | (Base & { type: "text"; placeholder?: string; multiline?: boolean })
  /** Texto que existe em português e inglês: edita só o `pt`, preserva o `en`. */
  | (Base & { type: "i18n"; placeholder?: string; multiline?: boolean })
  | (Base & { type: "link" })
  | (Base & { type: "image" })
  | (Base & { type: "select"; options: Option[] })
  | (Base & { type: "number"; step?: number; min?: number })
  | (Base & { type: "boolean"; onLabel?: string })
  | (Base & { type: "group"; fields: FieldDef[] })
  /** Grupo que pode ser desligado (vira `null`). */
  | (Base & {
      type: "optionalGroup";
      fields: FieldDef[];
      toggleLabel: string;
      create: () => Record<string, unknown>;
    })
  /** Item de uma lista identificado por `variant` (ex.: botão principal/secundário). */
  | (Base & {
      type: "variantItem";
      variant: string;
      fields: FieldDef[];
    })
  | (Base & {
      type: "list";
      itemLabel: string;
      /** Campos de cada item (objeto) ou um único campo para itens simples (texto). */
      item: { fields: FieldDef[] } | { scalar: FieldDef };
      newItem: () => unknown;
      title?: (item: unknown, index: number) => string;
      addLabel?: string;
      max?: number;
      min?: number;
      emptyHint?: string;
    });

export type Schema = FieldDef[];
