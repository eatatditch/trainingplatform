import { createClient } from "@/lib/supabase/server";
import { db } from "./db";

export interface AppUser {
  id: string; // Prisma User.id
  authId: string; // Supabase auth.users.id
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";
}

/**
 * Get the current authenticated user with their Prisma profile.
 * Returns null if not logged in or profile not found.
 */
export async function getUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const profile = await db.user.findFirst({
    where: { authId: authUser.id, isActive: true },
  });

  if (!profile) return null;

  return {
    id: profile.id,
    authId: profile.authId!,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role as AppUser["role"],
  };
}
