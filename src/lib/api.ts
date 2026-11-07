// Cliente HTTP simples para a inova-api.
// Lê o token JWT do cookie (inova_admin_token), grava após login, e envia em todo request.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

const TOKEN_COOKIE = "inova_admin_token";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function getToken(): string | undefined {
  return getCookie(TOKEN_COOKIE);
}

export function setToken(token: string) {
  setCookie(TOKEN_COOKIE, token);
}

export function clearToken() {
  deleteCookie(TOKEN_COOKIE);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function authHeaders(headers: Headers, auth?: boolean) {
  if (auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
}

/** Junta mensagens do Nest (string ou lista) em um texto só. */
function messageOf(data: any, rawText: string | null, status: number): string {
  const m = data?.message ?? data?.error;
  if (Array.isArray(m)) return m.join("; ");
  if (typeof m === "string" && m) return m;
  if (rawText && rawText.length < 300 && !rawText.trim().startsWith("<")) return rawText;
  return `Erro ${status}`;
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers = new Headers(init.headers);
  // FormData define o próprio Content-Type (com o boundary): não sobrescrever.
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  authHeaders(headers, init.auth);

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    throw new ApiError(
      "Não foi possível falar com o servidor. Verifique a conexão e tente de novo.",
      0,
      err,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  let rawText: string | null = null;
  let data: any = null;
  try {
    if (res.status !== 204) {
      rawText = await res.text();
      if (contentType.includes("application/json") && rawText) {
        data = JSON.parse(rawText);
      }
    }
  } catch {
    // corpo inválido: segue com data = null
  }

  if (!res.ok) {
    throw new ApiError(
      messageOf(data, rawText, res.status),
      res.status,
      data?.errors ?? data?.details ?? rawText,
    );
  }
  return data as T;
}

/** Baixa um arquivo (ex.: CSV) enviando o token, e dispara o download no navegador. */
export async function downloadFile(path: string, fallbackName: string) {
  const headers = new Headers();
  authHeaders(headers);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { headers });
  } catch {
    throw new ApiError("Não foi possível falar com o servidor para baixar o arquivo.", 0);
  }
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {}
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {}
    throw new ApiError(messageOf(data, text, res.status), res.status);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") ?? "";
  const name = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? fallbackName;
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "DELETE" }),
  /** Envia arquivo (multipart). O Content-Type é definido pelo navegador. */
  upload: <T>(path: string, form: FormData, init?: RequestInit) =>
    request<T>(path, { ...init, method: "POST", body: form }),
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
};

export async function login(email: string, password: string) {
  const data = await api.post<{ token: string; user: AdminUser }>(
    "/cms/auth/login",
    { email, password },
    { credentials: "omit" },
  );
  setToken(data.token);
  return data.user;
}

export async function me(): Promise<AdminUser> {
  const data = await api.get<{ user: AdminUser }>("/cms/admin/me");
  return data.user;
}

export async function logout() {
  try {
    await api.post("/cms/auth/logout");
  } catch {
    // ignore
  } finally {
    clearToken();
  }
}
