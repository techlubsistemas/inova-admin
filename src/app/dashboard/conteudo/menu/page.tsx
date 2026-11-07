"use client";

import { PageHeader } from "@/components/page-header";
import { SettingEditor } from "@/components/setting-editor";
import { Notice } from "@/components/structured/ui";
import { Button } from "@/components/ui/button";
import { setPtKeepShape } from "@/lib/i18n";
import { navSchema } from "@/lib/setting-schemas";
import { SEED_HINT, useSettings } from "@/lib/use-settings";

type Obj = Record<string, unknown>;

// Menu que o site mostra hoje (inova-institutional/src/lib/nav.ts, DEFAULT_NAV).
// Quando o menu é salvo aqui, o link secundário "Calculadora" deixa de aparecer à parte;
// por isso ele entra como um link comum no fim da lista.
const CURRENT_LINKS = [
  { label: "Soluções", href: "/#solucoes" },
  { label: "Indústrias", href: "/industrias" },
  { label: "Cases", href: "/cases" },
  { label: "Blog", href: "/blog" },
  { label: "Glossário", href: "/glossario" },
  { label: "Calculadora", href: "/calculadora" },
];
const CURRENT_CTA = { label: "Solicitar orçamento", href: "/#contato" };

function labelFor(current: unknown, href: string, text: string) {
  const list = Array.isArray(current) ? current : [];
  const found = list.find(
    (l): l is Obj => typeof l === "object" && l !== null && (l as Obj).href === href,
  );
  return setPtKeepShape(found?.label, text);
}

function MenuExtra({ value, setValue }: { value: Obj; setValue: (n: Obj) => void }) {
  const links = Array.isArray(value.links) ? value.links : [];
  const hasCta = typeof value.cta === "object" && value.cta !== null;

  function fromCurrent() {
    if (
      (links.length > 0 || hasCta) &&
      !window.confirm(
        "Isso substitui os links e o botão que estão na tela pelos do menu atual do site. Continuar?",
      )
    )
      return;
    const cta = (value.cta ?? null) as Obj | null;
    setValue({
      ...value,
      links: CURRENT_LINKS.map((l) => ({
        label: labelFor(value.links, l.href, l.label),
        href: l.href,
      })),
      cta: {
        label: setPtKeepShape(cta?.label, CURRENT_CTA.label),
        href: CURRENT_CTA.href,
      },
    });
  }

  return (
    <div className="space-y-3">
      <Notice tone="warning">
        Ao salvar um menu aqui, ele substitui o menu padrão do site, inclusive o link
        &quot;Calculadora&quot; que hoje aparece separado dos demais. Para manter o que já existe,
        comece pelo menu atual.
      </Notice>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Preenche os campos com os links e o botão de hoje. Nada é salvo até você clicar em
          Salvar.
        </p>
        <Button size="sm" variant="outline" className="shrink-0" onClick={fromCurrent}>
          Partir do menu atual
        </Button>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { items, map, loading, error } = useSettings();

  return (
    <div>
      <PageHeader
        title="Menu do topo"
        description="Links do menu que aparece no topo de todas as páginas, e o botão de destaque."
      />

      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <Notice tone="error">{error}</Notice>}
      {!loading && !error && items.length === 0 && (
        <div className="mb-4">
          <Notice tone="warning">{SEED_HINT}</Notice>
        </div>
      )}

      {!loading && !error && (
        <SettingEditor
          settingKey="nav"
          meta={{
            label: "Menu do topo",
            description:
              "Se nenhum link for salvo, o site continua com o menu atual. Em produção, a mudança aparece em até 60 segundos.",
          }}
          schema={navSchema}
          item={map.nav ?? null}
          previewable
          renderExtra={(v, set) => <MenuExtra value={v} setValue={set} />}
        />
      )}
    </div>
  );
}
