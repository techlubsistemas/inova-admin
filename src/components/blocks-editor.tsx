"use client";

import { Input } from "@/components/ui/input";
import { ptText, setPtKeepShape } from "@/lib/i18n";
import { AddButton, ItemShell, Notice, fieldCls, moveItem } from "@/components/structured/ui";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

/**
 * Editor de blocos de texto (artigos e páginas legais). Lê e grava o formato que o
 * site entende (`adaptArticleSection`): { kind, text | items | headers/rows | cite | tone }.
 * Aceita também o formato antigo ({ type: "paragraph", content }) e textos como
 * string ou { pt, en }: o que já existe é editado no lugar, sem perder `en` nem
 * chaves desconhecidas. Blocos de tipos que o painel não conhece ficam intactos.
 */

export type Block = Record<string, unknown>;

type Kind = "h2" | "h3" | "p" | "ul" | "ol" | "quote" | "callout" | "table";

const KIND_LABEL: Record<Kind, string> = {
  h2: "Título",
  h3: "Subtítulo",
  p: "Parágrafo",
  ul: "Lista com marcadores",
  ol: "Lista numerada",
  quote: "Citação",
  callout: "Destaque",
  table: "Tabela",
};

const ADD_ORDER: Kind[] = ["h2", "h3", "p", "ul", "ol", "quote", "callout", "table"];

const TONES = [
  { value: "info", label: "Informação" },
  { value: "warning", label: "Atenção" },
  { value: "success", label: "Sucesso" },
];

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function kindOf(b: Block): Kind | null {
  const k = String(b.kind ?? b.type ?? "");
  if (k === "paragraph") return "p";
  return (ADD_ORDER as string[]).includes(k) ? (k as Kind) : null;
}

function textKey(b: Block): string {
  if ("text" in b) return "text";
  if ("content" in b) return "content";
  return "text";
}

function newBlock(kind: Kind): Block {
  switch (kind) {
    case "ul":
    case "ol":
      return { kind, items: [""] };
    case "quote":
      return { kind, text: "", cite: "" };
    case "callout":
      return { kind, tone: "info", text: "" };
    case "table":
      return { kind, headers: ["", ""], rows: [["", ""]] };
    default:
      return { kind, text: "" };
  }
}

// ----- itens (listas) -----

function itemsArray(b: Block): unknown[] {
  const it = b.items;
  if (Array.isArray(it)) return it;
  if (isObj(it) && Array.isArray(it.pt)) return it.pt;
  return [];
}

function withItems(b: Block, next: unknown[]): Block {
  const it = b.items;
  if (isObj(it) && Array.isArray(it.pt)) return { ...b, items: { ...it, pt: next } };
  return { ...b, items: next };
}

export function BlocksEditor({
  value,
  onChange,
}: {
  value: Block[];
  onChange: (next: Block[]) => void;
}) {
  const set = (i: number, b: Block) => onChange(value.map((x, j) => (j === i ? b : x)));

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
          Nenhum bloco ainda. Use os botões abaixo para adicionar títulos, parágrafos, listas etc.
        </p>
      )}
      {value.map((b, i) => {
        const kind = kindOf(b);
        const label = kind ? KIND_LABEL[kind] : `Bloco "${String(b.kind ?? b.type ?? "?")}"`;
        const preview = kind ? ptText(b[textKey(b)]).slice(0, 50) : "";
        return (
          <ItemShell
            key={i}
            index={i}
            count={value.length}
            title={preview ? `${label}: ${preview}` : label}
            onMove={(to) => onChange(moveItem(value, i, to))}
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          >
            {kind === null && (
              <Notice tone="warning">
                Este tipo de bloco não é editado aqui. Ele é mantido como está e você pode
                movê-lo ou removê-lo.
              </Notice>
            )}
            {(kind === "h2" || kind === "h3") && (
              <Input
                aria-label={label}
                value={ptText(b[textKey(b)])}
                onChange={(e) =>
                  set(i, { ...b, [textKey(b)]: setPtKeepShape(b[textKey(b)], e.target.value) })
                }
              />
            )}
            {(kind === "p" || kind === "quote" || kind === "callout") && (
              <textarea
                aria-label={label}
                rows={kind === "p" ? 4 : 3}
                className={fieldCls}
                value={ptText(b[textKey(b)])}
                onChange={(e) =>
                  set(i, { ...b, [textKey(b)]: setPtKeepShape(b[textKey(b)], e.target.value) })
                }
              />
            )}
            {kind === "quote" && (
              <Input
                aria-label="Autor da citação"
                placeholder="Autor ou fonte da citação (opcional)"
                value={ptText(b.cite)}
                onChange={(e) => set(i, { ...b, cite: setPtKeepShape(b.cite, e.target.value) })}
              />
            )}
            {kind === "callout" && (
              <select
                aria-label="Tipo de destaque"
                className={fieldCls}
                value={typeof b.tone === "string" ? b.tone : "info"}
                onChange={(e) => set(i, { ...b, tone: e.target.value })}
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
                {typeof b.tone === "string" && !TONES.some((t) => t.value === b.tone) && (
                  <option value={b.tone}>{b.tone}</option>
                )}
              </select>
            )}
            {(kind === "ul" || kind === "ol") && (
              <ListItems block={b} onChange={(nb) => set(i, nb)} ordered={kind === "ol"} />
            )}
            {kind === "table" && <TableEditor block={b} onChange={(nb) => set(i, nb)} />}
            {kind === null && (
              <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-[10px]">
                {JSON.stringify(b, null, 2)}
              </pre>
            )}
          </ItemShell>
        );
      })}
      <div className="flex flex-wrap gap-2">
        {ADD_ORDER.map((k) => (
          <AddButton
            key={k}
            label={KIND_LABEL[k]}
            onClick={() => onChange([...value, newBlock(k)])}
          />
        ))}
      </div>
    </div>
  );
}

function ListItems({
  block,
  onChange,
  ordered,
}: {
  block: Block;
  onChange: (b: Block) => void;
  ordered: boolean;
}) {
  const items = itemsArray(block);
  const setAt = (i: number, text: string) =>
    onChange(withItems(block, items.map((it, j) => (j === i ? setPtKeepShape(it, text) : it))));
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
            {ordered ? `${i + 1}.` : "•"}
          </span>
          <Input
            aria-label={`Item ${i + 1}`}
            value={ptText(it)}
            onChange={(e) => setAt(i, e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            disabled={i === 0}
            onClick={() => onChange(withItems(block, moveItem(items, i, i - 1)))}
            title="Subir"
          >
            ↑
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            disabled={i === items.length - 1}
            onClick={() => onChange(withItems(block, moveItem(items, i, i + 1)))}
            title="Descer"
          >
            ↓
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-destructive hover:text-destructive"
            onClick={() => onChange(withItems(block, items.filter((_, j) => j !== i)))}
            title="Remover item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <AddButton label="Adicionar item" onClick={() => onChange(withItems(block, [...items, ""]))} />
    </div>
  );
}

function TableEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const headers: unknown[] = Array.isArray(block.headers) ? block.headers : [];
  const rows: unknown[][] = Array.isArray(block.rows)
    ? (block.rows as unknown[]).map((r) => (Array.isArray(r) ? r : []))
    : [];
  const cols = Math.max(headers.length, ...rows.map((r) => r.length), 1);
  const pad = (arr: unknown[]) => Array.from({ length: cols }, (_, i) => arr[i] ?? "");
  const hs = pad(headers);
  const rs = rows.map(pad);

  const emit = (h: unknown[], r: unknown[][]) => onChange({ ...block, headers: h, rows: r });

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {hs.map((h, c) => (
                <th key={c} className="p-1">
                  <Input
                    aria-label={`Cabeçalho da coluna ${c + 1}`}
                    placeholder={`Coluna ${c + 1}`}
                    value={ptText(h)}
                    onChange={(e) =>
                      emit(
                        hs.map((x, k) => (k === c ? setPtKeepShape(x, e.target.value) : x)),
                        rs,
                      )
                    }
                  />
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rs.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="p-1">
                    <Input
                      aria-label={`Linha ${r + 1}, coluna ${c + 1}`}
                      value={ptText(cell)}
                      onChange={(e) =>
                        emit(
                          hs,
                          rs.map((rr, k) =>
                            k === r
                              ? rr.map((x, m) => (m === c ? setPtKeepShape(x, e.target.value) : x))
                              : rr,
                          ),
                        )
                      }
                    />
                  </td>
                ))}
                <td className="p-1">
                  <div className="flex">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-1"
                      disabled={r === 0}
                      onClick={() => emit(hs, moveItem(rs, r, r - 1))}
                      title="Subir linha"
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-1"
                      disabled={r === rs.length - 1}
                      onClick={() => emit(hs, moveItem(rs, r, r + 1))}
                      title="Descer linha"
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-1 text-destructive hover:text-destructive"
                      onClick={() => emit(hs, rs.filter((_, k) => k !== r))}
                      title="Remover linha"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <AddButton label="Adicionar linha" onClick={() => emit(hs, [...rs, Array(cols).fill("")])} />
        <AddButton label="Adicionar coluna" onClick={() => emit([...hs, ""], rs.map((r) => [...r, ""]))} />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={cols <= 1}
          onClick={() => emit(hs.slice(0, -1), rs.map((r) => r.slice(0, -1)))}
        >
          <Plus className="mr-1 h-3 w-3 rotate-45" />
          Remover última coluna
        </Button>
      </div>
    </div>
  );
}
