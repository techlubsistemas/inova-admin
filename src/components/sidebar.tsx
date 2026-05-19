"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
      { href: "/dashboard/conteudo/footer", label: "Footer", icon: Settings2 },
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
      { href: "/dashboard/leads", label: "Leads", icon: Inbox },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Conta",
    items: [{ href: "/dashboard/conta", label: "Minha conta", icon: User }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <span className="font-semibold tracking-tight">Inova Admin</span>
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
  );
}
