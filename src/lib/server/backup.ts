import { db } from '$lib/models';
import fs from 'fs';
import path from 'path';
import type { BackupOptions, BackupResult } from './types';
import { backupDir } from '$lib/config';




export class BackupService {
    options: BackupOptions;

    constructor(options: BackupOptions = { backupDir: backupDir }) {
        this.options = options;
    }

    static async getCollections(): Promise<string[]> {
        const collections = await db.listCollections().toArray();
        return collections
            .map(col => col.name)
            .filter(name => !name.startsWith('system.'));
    }

    async backupDatabase(): Promise<BackupResult> {

        try {
            // 连接数据库

            // 获取要备份的集合
            const allCollections = await BackupService.getCollections();
            const collectionsToBackup = this.options.collections?.length
                ? this.options.collections.filter(col => allCollections.includes(col))
                : allCollections;

            if (collectionsToBackup.length === 0) {
                return {
                    success: false,
                    message: 'No valid collections found to backup'
                };
            }

            // 创建备份目录
            this.ensureBackupDir();

            // 生成备份文件名
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = this.options.backupName
                ? `${this.options.backupName}_${timestamp}.json`
                : `test_backup_${timestamp}.json`;

            const backupFilePath = path.join(this.options.backupDir, backupFileName);

            // 备份数据
            const backupData = {
                metadata: {
                    id: `backup_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    database: 'test',
                    collections: collectionsToBackup,
                    version: '1.0'
                },
                data: {} as Record<string, any[]>
            };

            let totalDocuments = 0;

            // 备份每个集合
            for (const collectionName of collectionsToBackup) {
                const collection = db.collection(collectionName);
                const documents = await collection.find().toArray();

                backupData.data[collectionName] = documents;
                totalDocuments += documents.length;

                console.log(`Backed up ${documents.length} documents from ${collectionName}`);
            }

            // 写入文件
            fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

            // 断开连接

            return {
                success: true,
                message: 'Backup completed successfully',
                backupFile: backupFileName,
                collections: collectionsToBackup,
                documentCount: totalDocuments
            };
        } catch (error) {
            console.error('Backup failed:', error);
            return {
                success: false,
                message: 'Backup failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async listBackups(): Promise<string[]> {
        try {
            this.ensureBackupDir();

            const files = fs.readdirSync(this.options.backupDir)
                .filter(file => file.endsWith('.json'))
                .sort()
                .reverse();

            return files;
        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }

    async getBackupInfo(backupFile: string): Promise<any> {
        try {
            const backupPath = path.join(this.options.backupDir, backupFile);

            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }

            const data = fs.readFileSync(backupPath, 'utf8');
            const backupData = JSON.parse(data);

            return {
                fileName: backupFile,
                metadata: backupData.metadata,
                collections: Object.keys(backupData.data),
                documentCounts: Object.entries(backupData.data).reduce((acc, [key, value]) => {
                    acc[key] = (value as any[]).length;
                    return acc;
                }, {} as Record<string, number>)
            };
        } catch (error) {
            console.error('Failed to get backup info:', error);
            throw error;
        }
    }

    private ensureBackupDir(): void {
        if (!fs.existsSync(this.options.backupDir)) {
            fs.mkdirSync(this.options.backupDir, { recursive: true });
        }
    }
}