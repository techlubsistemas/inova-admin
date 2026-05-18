"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] Unhandled error:", error);
    console.error("[admin] Stack:", error.stack);
    console.error("[admin] Digest:", error.digest);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-lg rounded-md border border-destructive/30 bg-background p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-destructive">
          Algo deu errado
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {error.message || "Erro inesperado no painel."}
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-muted-foreground">
            Digest: <code className="font-mono">{error.digest}</code>
          </p>
        )}
        <details className="mb-4 rounded-md bg-muted/50 p-3 text-xs">
          <summary className="cursor-pointer font-medium">Stack trace</summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">
            {error.stack}
          </pre>
        </details>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  );
}
