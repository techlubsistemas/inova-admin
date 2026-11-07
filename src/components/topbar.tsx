"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout, type AdminUser } from "@/lib/api";

export function Topbar({
  user,
  menuOpen = false,
  onMenuClick,
}: {
  user: AdminUser | null;
  menuOpen?: boolean;
  onMenuClick?: () => void;
}) {
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="px-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="menu-lateral"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="truncate text-sm text-muted-foreground">
          Painel administrativo
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {user && (
          <div className="hidden min-w-0 text-right sm:block">
            <div className="truncate text-sm font-medium leading-none">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
