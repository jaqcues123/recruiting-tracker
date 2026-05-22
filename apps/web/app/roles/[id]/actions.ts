"use server";

import { db } from "@/lib/db";
import { roles } from "@recruiting/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateRolePriority(roleId: number, priority: number) {
  await db.update(roles).set({ priority }).where(eq(roles.id, roleId));
  revalidatePath(`/roles/${roleId}`);
}

export async function updateRoleStatus(roleId: number, status: string) {
  await db.update(roles).set({ status }).where(eq(roles.id, roleId));
  revalidatePath(`/roles/${roleId}`);
}
