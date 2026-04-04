import { getUser, type AppUser } from "./auth";
import { redirect } from "next/navigation";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";

export async function getCurrentUser(): Promise<AppUser | null> {
  return getUser();
}

export async function requireAuth(): Promise<AppUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<AppUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) redirect("/unauthorized");
  return user;
}

export async function requireAdmin(): Promise<AppUser> {
  return requireRole(["SUPER_ADMIN", "ADMIN"]);
}

export async function requireManager(): Promise<AppUser> {
  return requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
}

export function isAdmin(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isManager(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER";
}
