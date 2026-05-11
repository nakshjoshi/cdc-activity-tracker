/**
 * proxy.ts — Next.js 16 route protection (replaces deprecated middleware.ts)
 *
 * Next.js 16 renamed the file convention from `middleware` → `proxy` and
 * defaults it to the Node.js runtime, so all Node modules (jose, crypto, pg)
 * are fully supported here.
 *
 * The exported function MUST be named `proxy` (not `middleware`).
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);

const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get("tnp_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify JWT — jose is Edge/Node-compatible
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Forward user info to server components via headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id",   String(payload.userId ?? ""));
    requestHeaders.set("x-user-role",  String(payload.role   ?? ""));
    requestHeaders.set("x-user-name",  String(payload.name   ?? ""));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalid or expired — clear cookie and redirect
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("tnp_session");
    return response;
  }
}

export const config = {
  // Protect everything except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
