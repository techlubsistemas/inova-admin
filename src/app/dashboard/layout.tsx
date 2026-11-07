"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { me, ApiError, type AdminUser, clearToken } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const load = useCallback(() => {
    setLoading(true);
    me()
      .then((u) => {
        setUser(u);
        setNetworkError(false);
      })
      .catch((err) => {
        // Só uma resposta 401 da API significa "sessão inválida".
        // Queda de rede ou erro do servidor não desloga: mostra aviso.
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }
        setNetworkError(true);
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} menuOpen={menuOpen} onMenuClick={() => setMenuOpen((o) => !o)} />
        {networkError && (
          <div className="flex items-center justify-between gap-3 border-b border-yellow-300 bg-yellow-50 px-4 py-2 sm:px-6 text-sm text-yellow-900">
            <span>
              Não foi possível confirmar sua sessão com o servidor. Você continua
              conectado, mas o painel pode não carregar os dados.
            </span>
            <Button size="sm" variant="outline" onClick={load}>
              Tentar de novo
            </Button>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
