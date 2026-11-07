"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  FileText,
  BookOpen,
  Factory,
  Calculator,
  Inbox,
  BarChart3,
  Settings2,
  Newspaper,
  Globe,
  User,
  Menu,
  Scale,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Geral",
    items: [{ href: "/dashboard", label: "Visão geral", icon: LayoutDashboard }],
  },
  {
    label: "Conteúdo do site",
    items: [
      { href: "/dashboard/conteudo/home", label: "Home", icon: Globe },
      { href: "/dashboard/conteudo/footer", label: "Rodapé", icon: Settings2 },
      { href: "/dashboard/conteudo/menu", label: "Menu do topo", icon: Menu },
      { href: "/dashboard/conteudo/legal", label: "Páginas legais", icon: Scale },
      { href: "/dashboard/conteudo/seo", label: "SEO por página", icon: FileText },
    ],
  },
  {
    label: "Coleções",
    items: [
      { href: "/dashboard/cases", label: "Cases", icon: FileText },
      { href: "/dashboard/articles", label: "Artigos", icon: Newspaper },
      { href: "/dashboard/glossario", label: "Glossário", icon: BookOpen },
      { href: "/dashboard/setores", label: "Setores", icon: Factory },
    ],
  },
  {
    label: "Operação",
    items: [
      { href: "/dashboard/calculadora", label: "Calculadora", icon: Calculator },
      { href: "/dashboard/formularios", label: "Formulários", icon: ClipboardList },
      { href: "/dashboard/leads", label: "Leads", icon: Inbox },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Conta",
    items: [{ href: "/dashboard/conta", label: "Minha conta", icon: User }],
  },
];

/**
 * Em telas largas (lg+) a barra é fixa ao lado do conteúdo. Abaixo de lg ela vira
 * um menu recolhível: fica escondida e abre por cima do conteúdo pelo botão do topo.
 */
export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  // Fecha ao navegar (inclusive pelo botão voltar do navegador).
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside
        id="menu-lateral"
        className={cn(
          "w-64 shrink-0 border-r bg-card",
          open
            ? "fixed inset-y-0 left-0 z-40 block overflow-y-auto shadow-xl lg:static lg:z-auto lg:shadow-none"
            : "hidden lg:block",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <span className="font-semibold tracking-tight">Inova Admin</span>
          {open && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <nav className="flex flex-col gap-6 px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
