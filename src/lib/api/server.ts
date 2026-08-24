import { hasRole } from "$lib/auth/guard";
import { json } from "@sveltejs/kit";

export function checkUser(user: any) {
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

export function checkRole(user: any, role: string) {
    if (!hasRole(user, role)) {
        return json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
}