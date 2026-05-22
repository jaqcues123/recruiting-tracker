"use server";

import { db } from "@/lib/db";
import { roles } from "@recruiting/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth/get-user-id";

export async function updateRolePriority(roleId: number, priority: number) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  await db.update(roles).set({ priority }).where(and(eq(roles.id, roleId), eq(roles.userId, userId)));
  revalidatePath(`/roles/${roleId}`);
}

export async function updateRoleStatus(roleId: number, status: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  await db.update(roles).set({ status }).where(and(eq(roles.id, roleId), eq(roles.userId, userId)));
  revalidatePath(`/roles/${roleId}`);
}
