// Cliente HTTP simples para a inova-api.
// Lê o token JWT do cookie (admin_token), grava após login, e envia em todo request.

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

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const method = init.method ?? "GET";
  const url = `${API_URL}${path}`;
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (init.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    console.log(`[api] → ${method} ${url}`, { hasToken: !!token });
  } else {
    console.log(`[api] → ${method} ${url}`, { auth: false });
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    console.error(`[api] ✖ network error on ${method} ${url}`, err);
    throw new ApiError(
      `Falha de rede ao chamar ${path} (API offline em ${API_URL}?)`,
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
  } catch (err) {
    console.error(`[api] ✖ JSON parse error on ${method} ${url}`, err, { rawText });
  }

  if (!res.ok) {
    console.error(`[api] ✖ ${method} ${url} → ${res.status}`, {
      contentType,
      data,
      rawText,
      headers: Object.fromEntries(res.headers.entries()),
    });
    throw new ApiError(
      data?.message ?? data?.error ?? rawText ?? `Erro ${res.status}`,
      res.status,
      data?.details ?? rawText,
    );
  }
  console.log(`[api] ✓ ${method} ${url} → ${res.status}`);
  return data as T;
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
    "/auth/login",
    { email, password },
    { credentials: "omit" },
  );
  setToken(data.token);
  return data.user;
}

export async function me(): Promise<AdminUser> {
  const data = await api.get<{ user: AdminUser }>("/admin/me");
  return data.user;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore
  } finally {
    clearToken();
  }
}
