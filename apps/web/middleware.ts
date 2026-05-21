import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protect everything except auth pages, auth API, and static assets
    "/((?!auth|api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-).*)",
  ],
};
