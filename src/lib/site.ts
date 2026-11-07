import { api } from "@/lib/api";

/** Endereço público do site. Opcional: sem a variável, usa o site de produção. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.inovaengenharia.net.br"
).replace(/\/+$/, "");

/** Endereço público do formulário editável. */
export function publicFormUrl(slug: string) {
  return `${SITE_URL}/formularios/${slug}`;
}

/** Endereço de uma imagem: caminhos que começam com "/" vivem no site. */
export function imageSrc(url: string): string {
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return `${SITE_URL}${url}`;
  return url;
}

/**
 * Cria a prévia no servidor e abre o site em nova aba.
 * A aba é aberta antes da chamada (senão o navegador bloqueia o pop-up).
 */
export async function openPreview(key: string, value: Record<string, unknown>) {
  const win = window.open("about:blank", "_blank");
  try {
    const { token } = await api.post<{ token: string; expiresAt: string }>(
      "/cms/admin/previews",
      { key, value },
    );
    const url = `${SITE_URL}/previa?token=${encodeURIComponent(token)}`;
    if (win) win.location.href = url;
    else window.open(url, "_blank");
  } catch (err) {
    win?.close();
    throw err;
  }
}
