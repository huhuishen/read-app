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
    ObjectId,
} from "mongodb";

import type {
    Abortable, AggregateOptions, AnyBulkWriteOperation, BulkWriteOptions, CountDocumentsOptions, CreateIndexesOptions, DeleteOptions, Document, Filter, FindOneOptions, FindOptions, IndexSpecification, InsertOneOptions, OptionalUnlessRequiredId, Sort, UpdateFilter, UpdateOptions
} from "mongodb";

import MongoLiteClient from "./client.js";
import { MongoLiteError } from "./errors.js";
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
        return e instanceof MongoLiteError && e.code === "not_connected";
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
            throw new MongoLiteError("createIndex_failed", e.message || String(e), { cause: e });
        }
    }

    countDocuments(filter?: Filter<T> | undefined, options?: CountDocumentsOptions & Abortable) {
        try {
            return this.getCollection().countDocuments(filter, options);
        } catch (e: any) {
            throw new MongoLiteError("countDocuments_failed", e.message || String(e), { cause: e });
        }
    }

    /**
     * 插入单个文档
     */
    async insertOne(doc: Partial<T>, options?: InsertOneOptions | undefined, validate = true) {
        try {
            await this.flushPendingIndexes();
            // if (validate)
            //     this.schema.validate(doc);

            const now = new Date();
            const documents = { ...doc, createdAt: now } as unknown as OptionalUnlessRequiredId<T>;
            // doc = stripUndefined(doc);

            const res = await this.getCollection().insertOne(documents, options);
            return res;
        } catch (e: any) {
            throw new MongoLiteError("insertOne_failed", e.message || String(e), { cause: e });
        }
    }

    /**
     * 插入多个文档
     */
    async insertMany(docs: readonly T[], options?: BulkWriteOptions | undefined, validate = true) {
        try {
            await this.flushPendingIndexes();
            // if (validate)
            //     docs.forEach(doc => {
            //         this.schema.validate(doc);
            //     });

            const now = new Date();
            const documents = docs.map(doc => ({
                ...doc,
                createdAt: now,
            })) as unknown as OptionalUnlessRequiredId<T>[];

            const res = await this.getCollection().insertMany(documents, options);
            return res;
        } catch (e: any) {
            throw new MongoLiteError("insertMany_failed", e.message || String(e), { cause: e });
        }
    }


    /**
     * 查找单个文档
     */
    async findOne(filter: Filter<T>, options?: Omit<FindOneOptions, "timeoutMode"> & Abortable) {
        try {
            return await this.getCollection().findOne(filter, options);
        } catch (e: any) {
            throw new MongoLiteError("findOne_failed", e.message || String(e), { cause: e });
        }
    }

    async findOneAndUpdate(filter: Filter<T>, update: UpdateFilter<T> | Document[], options?: FindOneAndUpdateOptions) {
        try {
            if (options)
                return await this.getCollection().findOneAndUpdate(filter, update, options);
            else {
                return await this.getCollection().findOneAndUpdate(filter, update);
            }
        } catch (e: any) {
            throw new MongoLiteError("findOneAndUpdate_failed", e.message || String(e), { cause: e });
        }
    }

    async findOneById(id: string, options?: Omit<FindOneOptions, "timeoutMode"> & Abortable) {
        return this.findOne({ _id: this.id(id) } as any, options);
    }

    /**
     * 分页查询
     */
    async findPage(filter: Filter<T>, options: FindOptions & Abortable, pageOptions: PaginationOptions) {
        try {
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
                // hasNext: page < pageCount,
                // hasPrev: page > 1,
            };
        } catch (e: any) {
            throw new MongoLiteError("findPage_failed", e.message || String(e), { cause: e });
        }
    }

    /**
     * 查找多个文档
     */
    find(filter: Filter<T>, options?: FindOptions & Abortable) {
        try {
            const res = this.getCollection().find(filter, options);
            return res;
        } catch (e: any) {
            throw new MongoLiteError("find_failed", e.message || String(e), { cause: e });
        }
    }

    checkUpdate(update: UpdateFilter<T>, validate = true) {
        // if (!update.$set) {
        // $inc
        // throw new Error(`Missing $set in update document`); 
        // }
        // if (update.$set && validate) {
        //     this.schema.validate(update.$set);
        // }
        const now = new Date();

        update = {
            ...update,

            $set: {
                ...(update as any).$set,
                updatedAt: now,
            },

            $setOnInsert: {
                ...(update as any).$setOnInsert,
                createdAt: now,
            },
        };
        return update;
    }

    /**
     * 更新单个文档
     */
    async updateOne(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions & {
        sort?: Sort;
    }, validate = true) {
        try {
            await this.flushPendingIndexes();
            update = this.checkUpdate(update, validate);

            return await this.getCollection().updateOne(filter, update, options);
        } catch (e: any) {
            throw new MongoLiteError("updateOne_failed", e.message || String(e), { cause: e });
        }
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
        try {
            await this.flushPendingIndexes();
            update = this.checkUpdate(update, validate);

            return await this.getCollection().updateMany(filter, update, options);
        } catch (e: any) {
            throw new MongoLiteError("updateMany_failed", e.message || String(e), { cause: e });
        }
    }

    /**
     * 删除单个文档
     */
    async deleteOne(filter?: Filter<T> | undefined, options?: DeleteOptions) {
        try {
            return await this.getCollection().deleteOne(filter, options);
        } catch (e: any) {
            throw new MongoLiteError("deleteOne_failed", e.message || String(e), { cause: e });
        }
    }

    async deleteOneById(id: string, options?: DeleteOptions) {
        return this.deleteOne({ _id: this.id(id) } as any, options);
    }

    async deleteMany(filter?: Filter<any> | undefined, options?: DeleteOptions) {
        try {
            return await this.getCollection().deleteMany(filter, options);
        } catch (e: any) {
            throw new MongoLiteError("deleteMany_failed", e.message || String(e), { cause: e });
        }
    }

    /**
     * 判断文档是否存在
     */
    async exists(filter: Filter<T>): Promise<boolean> {
        try {
            const count = await this.countDocuments(filter, { limit: 1 });
            return count > 0;
        } catch (e: any) {
            throw new MongoLiteError("exists_failed", e.message || String(e), { cause: e });
        }
    }

    // convenience to convert id string -> ObjectId
    id(val: string | ObjectId) {
        try {
            return typeof val === "string" ? ensureObjectId(val) : val;
        } catch (e: any) {
            throw new MongoLiteError("id_failed", e.message || String(e), { cause: e });
        }
    }

    /**
     * 聚合查询
     */
    async aggregate<P extends Document>(pipeline?: Document[] | undefined, options?: AggregateOptions & Abortable) {
        try {
            return await this.getCollection().aggregate<P>(pipeline, options).toArray();
        } catch (e: any) {
            throw new MongoLiteError("aggregate_failed", e.message || String(e), { cause: e });
        }
    }

    /**
     * 事务操作
     */
    async withTransaction<TResult = void>(
        operation: (session: any) => Promise<TResult>
    ): Promise<TResult> {
        const session = this.client.startSession();
        try {
            return await session.withTransaction(async () => {
                return await operation(session);
            });
        } catch (e: any) {
            throw new MongoLiteError("withTransaction_failed", e.message || String(e), { cause: e });
        } finally {
            await session.endSession();
        }
    }

    /**
     * 批量写入操作
     */
    async bulkWrite(operations: readonly AnyBulkWriteOperation<T>[], options?: BulkWriteOptions) {
        try {
            await this.flushPendingIndexes();
            return await this.getCollection().bulkWrite(operations, options);
        } catch (e: any) {
            throw new MongoLiteError("bulkWrite_failed", e.message || String(e), { cause: e });
        }
    }

    async renameField(oldField: string, newField: string) {
        try {
            // 重命名所有文档的字段
            await this.getCollection().updateMany(
                {}, // 空条件 = 所有文档
                { $rename: { [oldField]: newField } }
            );
        } catch (e: any) {
            throw new MongoLiteError("renameField_failed", e.message || String(e), { cause: e });
        }
    }
}
