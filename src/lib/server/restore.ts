import fs from 'fs';
import { ObjectId } from 'mongodb';
import path from 'path';
import { db } from '$lib/models';
import type { BackupOptions, RestoreOptions, RestoreResult } from './types';
import { backupDir } from '$lib/config';

export class MongoConverter {
    /**
     * 将文档中的 ID 字段转换为 ObjectId
     * 规则：属性名称包含 'id' 或 '_id' 的字段，且值为有效的24位十六进制字符串
     */
    static convertIdsToObjectId(doc: any): any {
        if (!doc || typeof doc !== 'object') return doc;

        // 处理数组
        if (Array.isArray(doc)) {
            return doc.map(item => this.convertIdsToObjectId(item));
        }

        // 创建新对象
        const result: any = {};

        for (const [key, value] of Object.entries(doc)) {
            // 判断是否为 ID 字段
            const isIdField = key.toLowerCase().includes('id');

            if (isIdField && typeof value === 'string' && this.isValidObjectId(value)) {
                // 转换为 ObjectId
                result[key] = new ObjectId(value);
            } else if (value && typeof value === 'object') {
                // 递归处理嵌套对象
                result[key] = this.convertIdsToObjectId(value);
            } else {
                result[key] = value;
            }

            // 处理日期格式
            const isDate = key.includes('At');
            if (isDate && typeof value === 'string') {
                result[key] = new Date(value);
            }
        }

        return result;
    }

    /**
     * 检查字符串是否为有效的 ObjectId
     */
    static isValidObjectId(str: string): boolean {
        return /^[0-9a-fA-F]{24}$/.test(str);
    }

    /**
     * 批量处理文档数组
     */
    static batchConvertIdsToObjectId(docs: any[]): any[] {
        return docs.map(doc => this.convertIdsToObjectId(doc));
    }
}

export class RestoreService {
    options: BackupOptions;

    constructor(options: BackupOptions = { backupDir: backupDir }) {
        this.options = options;
    }

    async restoreDatabase(options: RestoreOptions): Promise<RestoreResult> {
        try {
            // 读取备份文件
            const backupPath = path.join(this.options.backupDir, options.backupFile);

            if (!fs.existsSync(backupPath)) {
                return {
                    success: false,
                    message: 'Backup file not found'
                };
            }

            const data = fs.readFileSync(backupPath, 'utf8');
            const backupData = JSON.parse(data);

            // 验证备份数据
            if (!backupData.metadata || !backupData.data) {
                return {
                    success: false,
                    message: 'Invalid backup file format'
                };
            }

            // 连接数据库

            // 确定要恢复的集合
            const availableCollections = Object.keys(backupData.data);
            const collectionsToRestore = options.collections?.length
                ? options.collections.filter(col => availableCollections.includes(col))
                : availableCollections;

            if (collectionsToRestore.length === 0) {
                return {
                    success: false,
                    message: 'No valid collections found to restore'
                };
            }

            let totalRestored = 0;
            const restoredCollections: string[] = [];

            // 恢复每个集合
            for (const collectionName of collectionsToRestore) {
                const documents = backupData.data[collectionName];

                if (!documents || !Array.isArray(documents)) {
                    console.warn(`No valid data found for collection: ${collectionName}`);
                    continue;
                }

                const collection = db.collection(collectionName);

                // 删除现有数据（如果指定）
                if (options.dropExisting) {
                    await collection.deleteMany({});
                    console.log(`Cleared existing data from ${collectionName}`);
                }

                // 对id进行处理
                const convertedDocuments = MongoConverter.batchConvertIdsToObjectId(documents);

                // 插入数据
                if (convertedDocuments.length > 0) {
                    const result = await collection.insertMany(convertedDocuments, { ordered: false });
                    totalRestored += result.insertedCount;
                    restoredCollections.push(collectionName);
                    console.log(`Restored ${result.insertedCount} documents to ${collectionName}`);
                }
            }

            // 断开连接

            return {
                success: true,
                message: 'Restore completed successfully',
                restoredCollections,
                restoredCount: totalRestored
            };
        } catch (error) {
            console.error('Restore failed:', error);
            return {
                success: false,
                message: 'Restore failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}