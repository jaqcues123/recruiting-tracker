"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/auth/sign-in");
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
