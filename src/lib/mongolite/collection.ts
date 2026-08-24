/**
 * collection.ts
 * Core collection wrapper providing:
 *  - insert (auto timestamps + defaults + validate)
 *  - find / findOne
 *  - updateOne (auto updatedAt injection, small DSL support)
 *  - deleteOne
 *
 * createCollection<T>(client, name, schema) returns typed wrapper.
 */

import {
    Collection, type FindOneAndUpdateOptions,
    MongoNotConnectedError,
    ObjectId,
} from "mongodb";

import type {
    Abortable, AggregateOptions, AnyBulkWriteOperation, BulkWriteOptions, CountDocumentsOptions, CreateIndexesOptions, DeleteOptions, Document, Filter, FindOneOptions, FindOptions, IndexSpecification, InsertOneOptions, OptionalUnlessRequiredId, Sort, UpdateFilter, UpdateOptions
} from "mongodb";

import MongoLiteClient from "./client.js";
import { ensureObjectId } from "./helpers.js";


export interface PaginationOptions {
    page: number;
    limit: number;
    sort?: Record<string, 1 | -1>;
}

export interface Entity {
    _id?: ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
}

export interface DataPage<T> {
    items: Partial<T>[],
    page: number,
    limit: number,
    totalItems: number,
    totalPages: number,
};

export class CollectionWrapper<T extends Entity> {
    private collection?: Collection<T>;
    private client: MongoLiteClient;
    private name: string;
    private pendingIndexes: Array<{ indexSpec: IndexSpecification; options?: CreateIndexesOptions }> = [];

    constructor(client: MongoLiteClient, name: string) {
        this.client = client;
        this.name = name;
    }

    private getCollection(): Collection<T> {
        if (!this.collection) {
            this.collection = this.client.collection<T>(this.name);
        }
        return this.collection;
    }

    private isNotConnectedError(e: unknown): boolean {
        return e instanceof MongoNotConnectedError;
    }

    private async flushPendingIndexes() {
        if (this.pendingIndexes.length === 0) return;
        const pending = [...this.pendingIndexes];
        this.pendingIndexes = [];
        const collection = this.getCollection();
        for (const { indexSpec, options } of pending) {
            await collection.createIndex(indexSpec, options);
        }
    }

    async ensureIndexes() {
        await this.flushPendingIndexes();
    }

    /**
     * 创建索引
     *    createIndex({ email: 1 }, { unique: true });
     */
    createIndex(indexSpec: IndexSpecification, options?: CreateIndexesOptions) {
        try {
            return this.getCollection().createIndex(indexSpec, options);
        } catch (e: any) {
            if (this.isNotConnectedError(e)) {
                this.pendingIndexes.push({ indexSpec, options });
                return Promise.resolve("__deferred__");
            }
            throw e;
        }
    }

    countDocuments(filter?: Filter<T> | undefined, options?: CountDocumentsOptions & Abortable) {
        return this.getCollection().countDocuments(filter, options);
    }

    /**
     * 插入单个文档
     */
    async insertOne(doc: Partial<T>, options?: InsertOneOptions | undefined, validate = true) {
        await this.flushPendingIndexes();

        const now = new Date();
        const documents = { ...doc, createdAt: now } as unknown as OptionalUnlessRequiredId<T>;

        return await this.getCollection().insertOne(documents, options);
    }

    /**
     * 插入多个文档
     */
    async insertMany(docs: readonly Partial<T>[], options?: BulkWriteOptions | undefined, validate = true) {
        await this.flushPendingIndexes();

        const now = new Date();
        const documents = docs.map(doc => ({
            ...doc,
            createdAt: now,
        })) as unknown as OptionalUnlessRequiredId<T>[];

        return await this.getCollection().insertMany(documents, options);
    }


    /**
     * 查找单个文档
     */
    async findOne(filter: Filter<T>, options?: Omit<FindOneOptions, "timeoutMode"> & Abortable) {
        return await this.getCollection().findOne(filter, options);
    }

    async findOneAndUpdate(filter: Filter<T>, update: UpdateFilter<T> | Document[], options?: FindOneAndUpdateOptions) {
        return await this.getCollection().findOneAndUpdate(filter, update, options ?? {});
    }

    async findOneById(id: string, options?: Omit<FindOneOptions, "timeoutMode"> & Abortable) {
        return this.findOne({ _id: this.id(id) } as any, options);
    }

    /**
     * 分页查询
     */
    async findPage(filter: Filter<T>, options: Omit<FindOptions, "sort"> & Abortable, pageOptions: PaginationOptions) {
        const { page, limit, sort } = pageOptions;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.getCollection()
                .find(filter, options)
                .sort(sort || { createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            this.getCollection().countDocuments(filter),
        ]);

        const pages = Math.ceil(total / limit);

        return {
            items: data,
            page,
            limit,
            totalItems: total,
            totalPages: pages,
        };
    }

    /**
     * 查找多个文档，返回惰性游标。
     * 注意：try/catch 不覆盖后续游标迭代的异步错误，调用方需在 toArray() 等处自行处理。
     */
    find(filter: Filter<T>, options?: FindOptions & Abortable) {
        return this.getCollection().find(filter, options);
    }

    checkUpdate(update: UpdateFilter<T>, validate = true) {
        const now = new Date();
        const result = { ...update };

        // 仅在已有 $set 时注入 updatedAt
        if ("$set" in result) {
            (result as any).$set = { ...(result as any).$set, updatedAt: now };
        }
        // 仅在已有 $setOnInsert 时注入 createdAt
        if ("$setOnInsert" in result) {
            (result as any).$setOnInsert = { ...(result as any).$setOnInsert, createdAt: now };
        }

        return result;
    }

    /**
     * 更新单个文档
     */
    async updateOne(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions & {
        sort?: Sort;
    }, validate = true) {
        await this.flushPendingIndexes();
        update = this.checkUpdate(update, validate);

        return await this.getCollection().updateOne(filter, update, options);
    }

    async updateOneById(id: string, update: UpdateFilter<T>, options?: UpdateOptions & {
        sort?: Sort;
    }, validate = true) {
        return this.updateOne({ _id: this.id(id) } as any, update, options);
    }

    /**
     * 更新多个文档
     */
    async updateMany(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions & {
        sort?: Sort;
    }, validate = true) {
        await this.flushPendingIndexes();
        update = this.checkUpdate(update, validate);

        return await this.getCollection().updateMany(filter, update, options);
    }

    /**
     * 删除单个文档
     */
    async deleteOne(filter: Filter<T>, options?: DeleteOptions) {
        return await this.getCollection().deleteOne(filter, options);
    }

    async deleteOneById(id: string, options?: DeleteOptions) {
        return this.deleteOne({ _id: this.id(id) } as any, options);
    }

    async deleteMany(filter: Filter<any>, options?: DeleteOptions) {
        return await this.getCollection().deleteMany(filter, options);
    }

    /**
     * 判断文档是否存在
     */
    async exists(filter: Filter<T>): Promise<boolean> {
        const count = await this.countDocuments(filter, { limit: 1 });
        return count > 0;
    }

    // convenience to convert id string -> ObjectId
    id(val: string | ObjectId) {
        return typeof val === "string" ? ensureObjectId(val) : val;
    }

    /**
     * 聚合查询
     */
    async aggregate<P extends Document>(pipeline?: Document[] | undefined, options?: AggregateOptions & Abortable) {
        return await this.getCollection().aggregate<P>(pipeline, options).toArray();
    }

    /**
     * 事务操作
     * @deprecated 不推荐使用事务，请使用乐观锁（updateOneWithVersionLock）替代方案
     */
    async withTransaction<TResult = void>(
        operation: (session: any) => Promise<TResult>
    ): Promise<TResult> {
        const session = this.client.startSession();
        try {
            return await session.withTransaction(async () => {
                return await operation(session);
            });
        } finally {
            await session.endSession();
        }
    }

    /**
     * 批量写入操作
     */
    async bulkWrite(operations: readonly AnyBulkWriteOperation<T>[], options?: BulkWriteOptions) {
        await this.flushPendingIndexes();
        return await this.getCollection().bulkWrite(operations, options);
    }

    async renameField(oldField: string, newField: string) {
        return await this.getCollection().updateMany(
            {},
            { $rename: { [oldField]: newField } }
        );
    }

    /**
     * 带乐观锁的更新。
     * 文档需包含 `version: number` 字段。
     * 更新条件中追加 version 匹配，更新操作中对 version 执行 $inc。
     * 返回 false 表示版本冲突（文档已被其他操作修改）或文档不存在。
     */
    async updateOneWithVersionLock(
        id: string,
        update: UpdateFilter<T>,
    ): Promise<boolean> {
        const doc = await this.findOneById(id);
        if (!doc) return false;

        const currentVersion = (doc as any).version ?? 0;

        const result = await this.updateOne(
            { _id: this.id(id), version: currentVersion } as any,
            { ...update, $inc: { ...(update as any).$inc, version: 1 } } as any,
        );

        return result.modifiedCount === 1;
    }
}
