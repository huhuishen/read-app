/**
 * client.ts
 * MongoLite client singleton wrapper around MongoClient
 */
import { Db, MongoClient, MongoNotConnectedError, type MongoClientOptions } from "mongodb";
import { type Entity } from "./collection.js";


export class MongoLiteClient {
    private client: MongoClient;
    private db?: Db;
    private connected = false;
    private log: (...args: any[]) => void;

    constructor(
        private uri: string,
        private dbName: string,
        opts: Partial<MongoClientOptions> = {},
        log?: (...args: any[]) => void
    ) {
        this.client = new MongoClient(uri, opts as MongoClientOptions);
        this.log = log ?? (() => { });
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        // 让 mongodb driver 的原生异常直接透传，调用方可用 MongoErrorHelper 解析
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        this.connected = true;

        this.log(`[MongoLite] Connected to ${this.dbName}`);
    }

    get isConnected(): boolean {
        return this.connected;
    }

    dbInstance(): Db {
        if (!this.db) throw new MongoNotConnectedError("MongoDB client not connected");
        return this.db;
    }

    collection<T extends Entity>(name: string) {
        return this.dbInstance().collection<T>(name);
    }

    /** @deprecated 不推荐使用事务，请使用乐观锁替代方案 */
    startSession() {
        return this.client.startSession();
    }

    async close(): Promise<void> {
        if (!this.connected) return;
        await this.client.close();
        this.connected = false;
        this.db = undefined;
    }
}

export default MongoLiteClient;
