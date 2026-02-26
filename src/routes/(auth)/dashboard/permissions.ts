export type Role =
    | "administrator"
    | "editor"
    | "author"
    | "critic"
    | "user"
    | "guest";

export const RolePermissions: Record<Role, string[]> = {
    administrator: ["*"],
    editor: ["article.review", "article.edit"],
    author: ["article.write"],
    critic: ["comment.review"],
    user: [],
    guest: [],
};

export function hasPermission(
    roles: Role[],
    permission: string,
) {
    for (const role of roles) {
        const perms = RolePermissions[role];
        if (perms.includes("*") || perms.includes(permission)) {
            return true;
        }
    }
    return false;
}
