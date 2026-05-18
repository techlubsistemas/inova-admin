"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout, type AdminUser } from "@/lib/api";

export function Topbar({ user }: { user: AdminUser | null }) {
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="text-sm text-muted-foreground">
        Painel administrativo
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <div className="text-sm font-medium leading-none">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
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
