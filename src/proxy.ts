import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { verifySessionFromRequest } from "./lib/auth/session";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const ADMIN_LOGIN = "/admin/login";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage =
      pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`);

    let session = null;
    try {
      session = await verifySessionFromRequest(request);
    } catch {
      session = null;
    }

    if (!isLoginPage && !session) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }

    if (isLoginPage && session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
