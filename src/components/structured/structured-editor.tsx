"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { ImageField } from "@/components/image-field";
import { OptionSelect } from "@/components/option-select";
import { hasEn, ptText, setPtKeepShape } from "@/lib/i18n";
import type { FieldDef, Schema } from "./types";
import {
  AddButton,
  EnBadge,
  FieldShell,
  ItemShell,
  Notice,
  fieldCls,
  moveItem,
} from "./ui";

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const LINK_SUGGESTIONS = [
  "/",
  "/#sobre",
  "/#solucoes",
  "/#contato",
  "/calculadora",
  "/cases",
  "/blog",
  "/glossario",
  "/industrias",
  "/politica-de-privacidade",
  "/termos-de-uso",
];

/**
 * Editor guiado por esquema. Recebe o valor (objeto) e devolve um NOVO objeto
 * a cada mudança, alterando só o que foi tocado.
 */
export function StructuredEditor({
  schema,
  value,
  onChange,
}: {
  schema: Schema;
  value: unknown;
  onChange: (next: Obj) => void;
}) {
  const obj = isObj(value) ? value : {};
  // Prefixo único por instância: vários editores na mesma tela não repetem ids.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <FieldsGroup fields={schema} value={obj} onChange={onChange} path={`se${uid}`} />
  );
}

function FieldsGroup({
  fields,
  value,
  onChange,
  path,
}: {
  fields: FieldDef[];
  value: Obj;
  onChange: (next: Obj) => void;
  path: string;
}) {
  return (
    <div className="space-y-4">
      {fields.map((f, i) => (
        <FieldView
          key={`${f.key}-${f.type}-${i}`}
          def={f}
          parent={value}
          path={`${path}.${f.key}${f.type === "variantItem" ? f.variant : ""}`}
          onParent={onChange}
        />
      ))}
    </div>
  );
}

/** Renderiza um campo lendo/escrevendo dentro do objeto pai. */
function FieldView({
  def,
  parent,
  path,
  onParent,
}: {
  def: FieldDef;
  parent: Obj;
  path: string;
  onParent: (next: Obj) => void;
}) {
  const raw = def.key === "" ? parent : parent[def.key];
  const set = (v: unknown) => onParent({ ...parent, [def.key]: v });
  const warning = def.warn ? def.warn(raw, parent) : null;
  const id = path.replace(/[^a-zA-Z0-9_-]/g, "_");

  switch (def.type) {
    case "text": {
      const v = typeof raw === "string" ? raw : typeof raw === "number" ? String(raw) : "";
      return (
        <FieldShell label={def.label} help={def.help} warning={warning} htmlFor={id}>
          {def.multiline ? (
            <textarea
              id={id}
              rows={3}
              value={v}
              placeholder={def.placeholder}
              onChange={(e) => set(e.target.value)}
              className={fieldCls}
            />
          ) : (
            <Input
              id={id}
              value={v}
              placeholder={def.placeholder}
              onChange={(e) => set(e.target.value)}
            />
          )}
        </FieldShell>
      );
    }
    case "i18n": {
      const v = ptText(raw);
      return (
        <FieldShell
          label={def.label}
          help={def.help}
          warning={warning}
          htmlFor={id}
          badge={hasEn(raw) ? <EnBadge /> : null}
        >
          {def.multiline ? (
            <textarea
              id={id}
              rows={3}
              value={v}
              placeholder={def.placeholder}
              onChange={(e) => set(setPtKeepShape(raw, e.target.value))}
              className={fieldCls}
            />
          ) : (
            <Input
              id={id}
              value={v}
              placeholder={def.placeholder}
              onChange={(e) => set(setPtKeepShape(raw, e.target.value))}
            />
          )}
        </FieldShell>
      );
    }
    case "link": {
      const v = typeof raw === "string" ? raw : "";
      const listId = `${id}_list`;
      return (
        <FieldShell
          label={def.label}
          help={
            def.help ??
            "Use / para páginas do próprio site (ex.: /cases) ou https:// para outros sites."
          }
          warning={warning}
          htmlFor={id}
        >
          <Input
            id={id}
            list={listId}
            value={v}
            placeholder="/cases ou https://…"
            onChange={(e) => set(e.target.value)}
          />
          <datalist id={listId}>
            {LINK_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </FieldShell>
      );
    }
    case "image": {
      const v = typeof raw === "string" ? raw : "";
      return (
        <FieldShell label={def.label} help={def.help} warning={warning}>
          <ImageField id={id} value={v} onChange={set} />
        </FieldShell>
      );
    }
    case "select": {
      const v = typeof raw === "string" ? raw : "";
      return (
        <FieldShell label={def.label} help={def.help} warning={warning} htmlFor={id}>
          <OptionSelect id={id} value={v} onChange={set} options={def.options} />
        </FieldShell>
      );
    }
    case "number": {
      const v = typeof raw === "number" ? String(raw) : "";
      return (
        <FieldShell label={def.label} help={def.help} warning={warning} htmlFor={id}>
          <Input
            id={id}
            type="number"
            step={def.step}
            min={def.min}
            value={v}
            onChange={(e) =>
              set(e.target.value === "" ? undefined : Number(e.target.value))
            }
          />
        </FieldShell>
      );
    }
    case "boolean": {
      return (
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={raw === true}
            onChange={(e) => set(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-input"
          />
          <span>
            {def.label}
            {def.help && (
              <span className="block text-[11px] text-muted-foreground">{def.help}</span>
            )}
          </span>
        </label>
      );
    }
    case "group": {
      const inner = isObj(raw) ? raw : {};
      return (
        <fieldset className="space-y-3 rounded-md border p-3">
          <legend className="px-1 text-sm font-medium">{def.label}</legend>
          {def.help && <p className="text-[11px] text-muted-foreground">{def.help}</p>}
          <FieldsGroup fields={def.fields} value={inner} onChange={set} path={path} />
        </fieldset>
      );
    }
    case "optionalGroup": {
      const on = isObj(raw);
      return (
        <fieldset className="space-y-3 rounded-md border p-3">
          <legend className="px-1 text-sm font-medium">{def.label}</legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={on}
              onChange={(e) => set(e.target.checked ? def.create() : null)}
              className="h-4 w-4 rounded border-input"
            />
            {def.toggleLabel}
          </label>
          {def.help && <p className="text-[11px] text-muted-foreground">{def.help}</p>}
          {on && (
            <FieldsGroup
              fields={def.fields}
              value={raw as Obj}
              onChange={set}
              path={path}
            />
          )}
        </fieldset>
      );
    }
    case "variantItem": {
      const list = Array.isArray(raw) ? raw : [];
      const idx = list.findIndex((it) => isObj(it) && it.variant === def.variant);
      const item = idx >= 0 && isObj(list[idx]) ? (list[idx] as Obj) : {};
      const update = (next: Obj) => {
        const merged = { ...next, variant: def.variant };
        const copy = [...list];
        if (idx >= 0) copy[idx] = merged;
        else copy.push(merged);
        set(copy);
      };
      return (
        <fieldset className="space-y-3 rounded-md border p-3">
          <legend className="px-1 text-sm font-medium">{def.label}</legend>
          {def.help && <p className="text-[11px] text-muted-foreground">{def.help}</p>}
          <FieldsGroup fields={def.fields} value={item} onChange={update} path={path} />
        </fieldset>
      );
    }
    case "list": {
      const list = Array.isArray(raw) ? (raw as unknown[]) : [];
      const max = def.max ?? Infinity;
      const min = def.min ?? 0;
      const scalar = "scalar" in def.item ? def.item.scalar : null;
      const titleOf = (item: unknown, i: number) => {
        if (def.title) {
          const t = def.title(item, i).trim();
          if (t) return t;
        }
        return def.itemLabel;
      };
      return (
        <div className="space-y-2">
          <div>
            <div className="text-sm font-medium">{def.label}</div>
            {def.help && <p className="text-[11px] text-muted-foreground">{def.help}</p>}
            {warning && <Notice tone="warning">{warning}</Notice>}
          </div>
          {list.length === 0 && (
            <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              {def.emptyHint ?? "Nenhum item ainda."}
            </p>
          )}
          {list.map((item, i) => (
            <ItemShell
              key={i}
              index={i}
              count={list.length}
              title={scalar ? def.itemLabel : titleOf(item, i)}
              canRemove={list.length > min}
              onMove={(to) => set(moveItem(list, i, to))}
              onRemove={() => set(list.filter((_, j) => j !== i))}
            >
              {scalar ? (
                <FieldView
                  def={{ ...scalar, key: "v" }}
                  parent={{ v: item }}
                  path={`${path}_${i}`}
                  onParent={(n) => set(list.map((it, j) => (j === i ? n.v : it)))}
                />
              ) : (
                <FieldsGroup
                  fields={(def.item as { fields: FieldDef[] }).fields}
                  value={isObj(item) ? item : {}}
                  onChange={(next) => set(list.map((it, j) => (j === i ? next : it)))}
                  path={`${path}_${i}`}
                />
              )}
            </ItemShell>
          ))}
          <AddButton
            label={def.addLabel ?? `Adicionar ${def.itemLabel.toLowerCase()}`}
            disabled={list.length >= max}
            onClick={() => set([...list, def.newItem()])}
          />
        </div>
      );
    }
  }
}
