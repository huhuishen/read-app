/**
 * client.ts
 * MongoLite client singleton wrapper around MongoClient
 */
import { Db, MongoClient } from "mongodb";
import { type Entity } from "./collection.js";
import { MongoLiteError } from "./errors.js";


export class MongoLiteClient {
    private client: MongoClient;
    private db?: Db;
    private connected = false;

    constructor(private uri: string, private dbName: string, opts: any = {}) {
        this.client = new MongoClient(uri, opts);
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.connected = true;

            console.log(`[MongoLite] Connected to ${this.uri}`);
        } catch (e: any) {
            throw new MongoLiteError("connect_failed", e.message || String(e));
        }
    }

    dbInstance(): Db {
        if (!this.db) throw new MongoLiteError("not_connected", "MongoDB client not connected");
        return this.db;
    }

    collection<T extends Entity>(name: string) {
        return this.dbInstance().collection<T>(name);
    }

    startSession() {
        return this.client.startSession();
    }

    async close(): Promise<void> {
        if (!this.connected) return;
        await this.client.close();
        this.connected = false;
    }
}

export default MongoLiteClient;
