"use client";

import { SettingEditor } from "@/components/setting-editor";
import { Notice } from "@/components/structured/ui";
import type { Schema } from "@/components/structured/types";
import { useSettings } from "@/lib/use-settings";

const schema: Schema = [
  {
    type: "boolean",
    key: "enabled",
    label: "Avisar por e-mail quando chegar um novo contato",
    onLabel: "Ligado",
  },
  {
    type: "list",
    key: "emails",
    label: "Quem recebe o aviso",
    itemLabel: "E-mail",
    addLabel: "Adicionar e-mail",
    item: { scalar: { type: "text", key: "", label: "E-mail", placeholder: "nome@empresa.com.br" } },
    newItem: () => "",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadNotifications() {
  const { map, loading, error } = useSettings();
  if (loading) return <div className="text-sm text-muted-foreground">Carregando...</div>;
  if (error) return <Notice tone="error">{error}</Notice>;
  return (
    <div className="space-y-3">
      <Notice tone="info">
        O aviso vale para novos leads da calculadora e novos envios dos formulários criados no
        painel. O diagnóstico (quiz) não envia aviso por e-mail.
      </Notice>
      <SettingEditor
        settingKey="lead_notifications"
        meta={{
          label: "Aviso de novos contatos por e-mail",
          description:
            "Quando ligado e com ao menos um e-mail na lista, cada novo contato gera um e-mail. O envio depende de o servidor de e-mail estar configurado na API; se não estiver, o contato é salvo normalmente, só não chega o aviso.",
        }}
        schema={schema}
        item={map.lead_notifications ?? null}
        validate={(v) => {
          const emails = Array.isArray(v.emails) ? (v.emails as unknown[]) : [];
          const bad = emails.find((e) => typeof e !== "string" || !EMAIL_RE.test(e.trim()));
          if (bad !== undefined) return `E-mail inválido: "${String(bad)}".`;
          if (v.enabled === true && emails.length === 0)
            return "Para ligar o aviso, informe ao menos um e-mail.";
          return null;
        }}
      />
    </div>
  );
}
