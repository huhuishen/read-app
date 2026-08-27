export type UserRole =
    | "administrator"
    | "editor"
    | "author"
    | "critic"
    | "user"
    | "guest";

export interface User {
    id: string;
    email: string;
    roles: UserRole[];
    name?: string;
    avatar?: string;
    title?: string[];
    award?: string[];
    profile?: { theme: string; avatarColor: string };
    isGuest?: boolean;
}

export interface Session {
    id: string;
    user: User;
    createdAt: number;
    lastSeenAt: number;
    expiresAt: number;
    /** 创建会话时的客户端 IP 地址，用于显示。 */
    ip?: string;
    /** 创建会话时的客户端 User-Agent，用于显示。 */
    userAgent?: string;
}