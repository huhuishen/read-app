import { CollectionWrapper, MongoLiteClient, type Entity } from "$lib/mongolite";
import { env } from '$env/dynamic/private';

const connectString = env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";

// 连接超时
const serverSelectionTimeoutMS =
    env.MONGODB_CONNECT_TIMEOUT ? parseInt(env.MONGODB_CONNECT_TIMEOUT) : 5000;

export const client = new MongoLiteClient(connectString, "test", {
    serverSelectionTimeoutMS,
});

await client.connect();


/**
 * factory
 */
export class Collection<T extends Entity> extends CollectionWrapper<T> {
    constructor(name: string) {
        super(client, name);
    }
}

export const db = client.dbInstance();