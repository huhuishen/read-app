/**
 * 会话管理 —— Facade 层
 *
 * 根据环境变量 MONGODB_URI 自动选择存储实现：
 * - 未设置：使用 MapSessionStore（内存存储，重启即清空）
 * - 已设置：使用 MongoSessionStore（MongoDB 持久化，TTL 索引自动清理过期会话）
 *
 * 对外函数均为异步，调用方需 await。
 */
import type { Session } from "./types";
import { env } from "$env/dynamic/private";

export const SESSION_COOKIE = "session_id";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;
export const MAX_SESSIONS_PER_USER = 5;

export interface SessionStore {
    create(id: string, session: Session): Promise<void>;
    get(id: string): Promise<Session | undefined>;
    list(): Promise<Session[]>;
    listByUserId(userId: string): Promise<Session[]>;
    delete(id: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}

/** 内存实现。未配置 MongoDB 时的回退方案，重启即清空。 */
export class MapSessionStore implements SessionStore {
    private readonly sessions = new Map<string, Session>();

    async create(id: string, session: Session) {
        this.sessions.set(id, session);
    }

    async get(id: string) {
        return this.sessions.get(id);
    }

    async list() {
        return Array.from(this.sessions.values());
    }

    async listByUserId(userId: string) {
        return Array.from(this.sessions.values()).filter(
            (session) => session.user.id === userId
        );
    }

    async delete(id: string) {
        this.sessions.delete(id);
    }

    async deleteByUserId(userId: string) {
        for (const [id, session] of this.sessions.entries()) {
            if (session.user.id === userId) {
                this.sessions.delete(id);
            }
        }
    }
}

// ── Store 初始化（ES module 顶层 await 在 SvelteKit 服务端安全） ─────
// 动态导入 Mongo 实现：未配置 MONGODB_URI 时不会建立数据库连接。
let sessionStore: SessionStore;
if (env.MONGODB_URI) {
    const { MongoSessionStore } = await import("./stores/mongo");
    sessionStore = new MongoSessionStore();
} else {
    sessionStore = new MapSessionStore();
}

console.log("[Session] Using", sessionStore.constructor.name);

// ── Facade 导出 ──────────────────────────────────────────────────────

/** 创建新会话。超过 MAX_SESSIONS_PER_USER 时先删除最旧的会话。 */
export async function createSession(id: string, session: Session): Promise<void> {
    const userSessions = await listUserSessions(session.user.id);
    if (userSessions.length >= MAX_SESSIONS_PER_USER) {
        userSessions.sort((a, b) => a.createdAt - b.createdAt);
        await sessionStore.delete(userSessions[0].id);
    }
    await sessionStore.create(id, session);
}

/** 获取有效会话，已过期则删除并返回 undefined */
export async function getSession(id: string, now = Date.now()): Promise<Session | undefined> {
    const session = await sessionStore.get(id);
    if (!session) return undefined;

    if (session.expiresAt <= now) {
        await sessionStore.delete(id);
        return undefined;
    }

    return session;
}

/** 滑动续期：刷新活动时间并将过期时间延长一个完整 TTL */
export async function touchSession(
    id: string,
    context: { ip?: string; userAgent?: string },
    now = Date.now()
) {
    const session = await getSession(id, now);

    if (!session) return undefined;

    // 客户端指纹校验：IP 或 User-Agent 与创建会话时不一致则视为会话劫持，立即销毁。
    // 仅当两侧值均非空时才比较，避免历史会话或代理丢头导致误杀。
    const ipMismatch = session.ip && context.ip && session.ip !== context.ip;
    const uaMismatch =
        session.userAgent && context.userAgent && session.userAgent !== context.userAgent;

    if (ipMismatch || uaMismatch) {
        // 会话劫持，立即销毁。这会造成被劫持者一同下线。
        // 禁用该行可以避免被劫持者被强制下线，保持其会话状态
        // 但会话劫持者会无法登录。
        // sessionStore.delete(id);
        return undefined;
    }

    session.lastSeenAt = now;
    session.expiresAt = now + SESSION_TTL_MS;
    sessionStore.create(id, session);

    return session;
}

/** 列出所有有效会话 */
export async function listSessions(now = Date.now()): Promise<Session[]> {
    return (await sessionStore.list()).filter((session) => session.expiresAt > now);
}

/** 列出指定用户的所有有效会话 */
export async function listUserSessions(userId: string, now = Date.now()): Promise<Session[]> {
    return (await sessionStore.listByUserId(userId)).filter(
        (session) => session.expiresAt > now
    );
}

/** 删除单个会话 */
export async function deleteSession(id: string): Promise<void> {
    await sessionStore.delete(id);
}

/** 删除指定用户的全部会话 */
export async function deleteUserSessions(userId: string): Promise<void> {
    await sessionStore.deleteByUserId(userId);
}
