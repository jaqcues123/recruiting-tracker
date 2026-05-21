import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protect everything except sign-in, auth API, and static assets
    // sign-up is intentionally NOT excluded — only you can create an account once signed in
    "/((?!auth/sign-in|api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-).*)",
  ],
};
