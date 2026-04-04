import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — skip all Supabase session handling
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  // Protected routes — check Supabase session
  try {
    const { updateSession } = await import("@/lib/supabase/middleware");
    const { user, supabaseResponse } = await updateSession(request);

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // If Supabase check fails, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
