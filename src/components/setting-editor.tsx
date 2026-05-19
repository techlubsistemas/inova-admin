"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type Setting = {
  key: string;
  value: unknown;
  updatedAt?: string;
};

export function SettingEditor({
  item,
  meta,
  onSaved,
}: {
  item: Setting;
  meta: { label: string; description: string };
  onSaved?: (updated: Setting) => void;
}) {
  const [text, setText] = useState(JSON.stringify(item.value, null, 2));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function save() {
    setErr(null);
    setOk(false);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      setErr("JSON inválido. Confira chaves, vírgulas e aspas.");
      return;
    }
    setSaving(true);
    try {
      const data = await api.put<{ item: Setting }>(
        `/cms/admin/settings/${item.key}`,
        { value: parsed },
      );
      onSaved?.(data.item);
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{meta.label}</CardTitle>
            <CardDescription className="text-xs">{meta.description}</CardDescription>
          </div>
          <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            key: {item.key}
          </code>
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
          spellCheck={false}
        />
        {err && (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {err}
          </p>
        )}
        {ok && (
          <p className="mt-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            Salvo. As mudanças aparecem no site dentro do tempo de ISR.
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setText(JSON.stringify(item.value, null, 2))}
          >
            Reverter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
