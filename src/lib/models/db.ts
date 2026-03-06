import { CollectionWrapper, MongoLiteClient, type Entity } from "$lib/mongolite";
import { SALT_ROUNDS } from "$lib/config";
import { env } from '$env/dynamic/private';
import bcrypt from "bcryptjs";
import { nanoid } from "$lib/util/client";

const connectString = env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";

// 连接超时
const serverSelectionTimeoutMS =
    env.MONGODB_CONNECT_TIMEOUT ? parseInt(env.MONGODB_CONNECT_TIMEOUT) : 5000;

export const client = new MongoLiteClient(connectString, "test", {
    serverSelectionTimeoutMS,
});

let initPromise: Promise<void> | null = null;

async function ensureDefaultAdminUser() {
    const users = client.collection<Record<string, unknown> & Entity>("users");
    const userCount = await users.countDocuments({}, { limit: 1 });

    if (userCount > 0) {
        return;
    }

    const passwordHash = await bcrypt.hash("admin", SALT_ROUNDS);

    await users.insertOne({
        id: nanoid(),
        email: "admin",
        name: "admin",
        password: passwordHash,
        title: [],
        award: [],
        roles: ["administrator", "user"],
        profile: {
            theme: "light",
            avatarColor: "",
        },
        readSeconds: 0,
        underlineCount: 0,
        underlineReplyCount: 0,
        commentCount: 0,
        activated: true,
        activateToken: "",
        activateExpireAt: new Date(0),
        bio: "",
        tags: "",
        createdAt: new Date(),
    });

    console.log("[Bootstrap] Created default administrator user: admin");
}

export async function initDb() {
    if (!initPromise) {
        initPromise = (async () => {
            await client.connect();
            await ensureDefaultAdminUser();
        })().catch((error) => {
            initPromise = null;
            throw error;
        });
    }

    return initPromise;
}


/**
 * factory
 */
export class Collection<T extends Entity> extends CollectionWrapper<T> {
    constructor(name: string) {
        super(client, name);
    }
}

export function getDb() {
    return client.dbInstance();
}
