"use client";

import { useActionState } from "react";
import { signUpWithEmail } from "./actions";
import Link from "next/link";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpWithEmail, null);

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Set up your recruiting tracker</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Name</label>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Min 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
