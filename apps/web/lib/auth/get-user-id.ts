import { auth } from "./server";

export async function getCurrentUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession();
  return (session?.user?.id as string | undefined) ?? null;
}
