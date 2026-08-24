/**
 * stores/mongo.ts
 * MongoDB 会话存储实现（基于 mongolite）
 *
 * 特性：
 * - 复用 db-client 的共享连接，避免额外建立数据库连接
 * - TTL 索引自动清理过期会话（MongoDB 后台线程每 60s 运行一次）
 * - sessionId 直接作为 _id，O(1) 读写
 */
import type { Session, User } from "../types";
import type { SessionStore } from "../session";
import type { Entity } from "$lib/mongolite";
import { CollectionWrapper } from "$lib/mongolite";
import { client } from "$lib/models";

// ── MongoDB 文档模型 ────────────────────────────────────────────────
interface SessionDoc extends Entity {
    _id: string;              // sessionId 直接作为 _id
    userId: string;           // 冗余，用于索引查询
    user: User;               // 嵌入文档
    createdAt: Date;
    lastSeenAt: Date;
    expiresAt: Date;          // BSON Date，用于 TTL 索引
    ip?: string;
    userAgent?: string;
}

// ── 转换层：SessionDoc <-> Session ──────────────────────────────────
function toSession(doc: SessionDoc): Session {
    return {
        id: doc._id as string,
        user: doc.user,
        createdAt: doc.createdAt?.getTime() ?? 0,
        lastSeenAt: doc.lastSeenAt.getTime(),
        expiresAt: doc.expiresAt.getTime(),
        ip: doc.ip,
        userAgent: doc.userAgent,
    };
}

function toDoc(id: string, session: Session): SessionDoc {
    return {
        _id: id,
        userId: session.user.id,
        user: session.user,
        createdAt: new Date(session.createdAt),
        lastSeenAt: new Date(session.lastSeenAt),
        expiresAt: new Date(session.expiresAt),
        ip: session.ip,
        userAgent: session.userAgent,
    };
}

// ── MongoSessionStore ───────────────────────────────────────────────
export class MongoSessionStore implements SessionStore {
    private readonly col: CollectionWrapper<SessionDoc>;

    constructor() {
        this.col = new CollectionWrapper<SessionDoc>(client, "sessions");

        // TTL 索引：expiresAt 到期后自动删除文档
        this.col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        // 用户查询索引：加速 listByUserId 和并发会话数检查
        this.col.createIndex({ userId: 1, expiresAt: 1 });
    }

    async create(id: string, session: Session): Promise<void> {
        // upsert：createSession 插入新会话，touchSession 复用此方法更新
        await this.col.updateOne(
            { _id: id } as any,
            { $set: toDoc(id, session) } as any,
            { upsert: true }
        );
    }

    async get(id: string): Promise<Session | undefined> {
        const doc = await this.col.findOne({ _id: id } as any);
        return doc ? toSession(doc as unknown as SessionDoc) : undefined;
    }

    async list(): Promise<Session[]> {
        const docs = await this.col.find({} as any).toArray();
        return docs.map((d) => toSession(d as unknown as SessionDoc));
    }

    async listByUserId(userId: string): Promise<Session[]> {
        const docs = await this.col.find(
            { userId } as any,
            { sort: { lastSeenAt: -1 } }
        ).toArray();
        return docs.map((d) => toSession(d as unknown as SessionDoc));
    }

    async delete(id: string): Promise<void> {
        await this.col.deleteOne({ _id: id } as any);
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.col.deleteMany({ userId } as any);
    }
}
