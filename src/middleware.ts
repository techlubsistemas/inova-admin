import { NextResponse, type NextRequest } from "next/server";

// Protege as rotas /dashboard/* contra acesso sem token.
// (Verificação real do JWT é feita pela API quando o client faz GET /admin/me.)

const PROTECTED_PREFIX = "/dashboard";
const TOKEN_COOKIE = "inova_admin_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
