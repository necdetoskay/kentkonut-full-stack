import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isOnAdmin = nextUrl.pathname.startsWith('/admin');
  
  if (isOnDashboard || isOnAdmin) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/login', nextUrl));
    }
  }
  
  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|pages).*)"],
};