import { error, redirect } from "@sveltejs/kit";
import type { User, UserRole } from "./types";

export function hasRole(user: User | undefined, role: UserRole | string): boolean {
    return user?.roles?.includes(role as UserRole) ?? false;
}

export function requireUser(user: User | undefined): User {
    if (!user) throw redirect(303, "/login");
    return user;
}

export function requireRole(user: User | undefined, role: UserRole | string): User {
    if (!user) throw redirect(303, "/login");
    if (!hasRole(user, role)) throw error(403, "Forbidden");
    return user;
}
