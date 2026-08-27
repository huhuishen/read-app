// example-usage.ts
import { SALT_ROUNDS, secret } from '$lib/config';
import { type Entity } from "$lib/mongolite";
import { t, type Infer } from "$lib/schema";
import { SimpleCache } from "$lib/util/cache";
import { nanoid } from "$lib/util/client";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Collection } from "./db";


export const UserSchema = t.object({
    id: t.string(),
    email: t.string(),
    name: t.string(),
    password: t.string(),
    title: t.array(t.string()),
    award: t.array(t.string()),
    roles: t.array(t.union(
        t.literal("administrator"),
        t.literal("editor"),
        t.literal("author"),
        t.literal("critic"),
        t.literal("user"),
        t.literal("guest"),
    )),
    profile: t.object({
        theme: t.string(),
        avatarColor: t.string(),
    }),
    // lastLogin: t.Object

    readSeconds: t.number(),
    underlineCount: t.number(),
    underlineReplyCount: t.number(),
    commentCount: t.number(),

    activated: t.boolean(),
    activateToken: t.string(),
    activateExpireAt: t.date(),

    bio: t.string(),
    tags: t.string(),
    isGuest: t.boolean(),
});

export type User = Infer<typeof UserSchema> & Entity;

export class UserService extends Collection<User> {
    constructor() {
        super("users");

        super.createIndex({ id: 1 }, { unique: true });
        super.createIndex({ email: 1 }, { unique: true });
    }

    cache = new SimpleCache();

    async hashPassword(password: string) {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }

    async verifyPassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }

    generateToken(user: Partial<User>): string {
        return jwt.sign(user, secret, { expiresIn: '7d' });
    }

    verifyToken(token: string): Partial<User> | null {
        try {
            return jwt.verify(token, secret) as Partial<User>;
        } catch {
            return null;
        }
    }

    async get(id: string) {
        return this.cache.get(id, async () => {
            return await super.findOne({ id },
                { projection: { _id: 0, password: 0 } });
        });
    }

    /**
     * 更新用户最后登录时间
     */
    // async updateLastLogin(userId: string) {
    //     return await this.updateOne({ id: userId }, {
    //         $set: { lastLogin: new Date() },
    //     });
    // }

    async add(email: string, name: string, password: string) {
        const exist = await this.findOne({ email });

        if (exist) {
            throw new Error("邮箱已存在");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const activateToken = nanoid(32);

        const user: Partial<User> = {
            id: crypto.randomUUID(),
            email,
            name,
            password: passwordHash,
            roles: ["user"],
            profile: {
                theme: "light",
                avatarColor: ""
            },
            activated: false,
            activateToken,
            activateExpireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isGuest: false,
        };

        const res = await this.insertOne(user);

        return [res, user];
    }

    async createGuest(): Promise<[Awaited<ReturnType<Collection<User>["insertOne"]>>, Partial<User>]> {
        const suffix = nanoid(8);
        const email = `guest_${suffix}@guest.local`;
        const name = `游客_${suffix.slice(0, 4)}`;
        const passwordHash = await bcrypt.hash(nanoid(32), 10);

        const user: Partial<User> = {
            id: crypto.randomUUID(),
            email,
            name,
            password: passwordHash,
            roles: ["guest"],
            profile: { theme: "light", avatarColor: "" },
            activated: true,
            activateToken: "",
            activateExpireAt: new Date(0),
            readSeconds: 0,
            underlineCount: 0,
            underlineReplyCount: 0,
            commentCount: 0,
            bio: "",
            tags: "",
            title: [],
            award: [],
            isGuest: true,
        };

        const res = await this.insertOne(user);
        return [res, user];
    }

    async upgradeGuest(userId: string, email: string, name: string, password: string) {
        const user = await this.findOne({ id: userId });
        if (!user) throw new Error("用户不存在");
        if (!user.isGuest) throw new Error("仅游客账号可转正");

        const exist = await this.findOne({ email });
        if (exist) throw new Error("邮箱已被占用");

        const passwordHash = await bcrypt.hash(password, 10);

        await this.updateOne(
            { id: userId },
            {
                $set: {
                    email,
                    name,
                    password: passwordHash,
                    roles: ["user"],
                    activated: true,
                    isGuest: false,
                },
            },
        );

        this.cache.delete(userId);

        return await this.findOne({ id: userId });
    }

    async cleanupExpiredGuests(days = 7) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await this.deleteMany({
            isGuest: true,
            createdAt: { $lt: cutoff },
        } as any);
        return result;
    }
}

export const Users = new UserService();

// insert (no createdAt / updatedAt required)
// const res = await Users.insert({
//     name: 'sdf',
// });
// console.log("insertedId:", res.insertedId);

// // update (use DSL inc)
// await Users.updateOne({ _id: res.insertedId }, { views: (t as any).inc(1) });

// // query
// const one = await Users.findOne({ _id: res.insertedId });
// console.log(one);
