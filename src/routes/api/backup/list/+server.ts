import { json, type RequestHandler } from '@sveltejs/kit';
import { BackupService } from '$lib/server/backup';

export const GET: RequestHandler = async () => {
    try {
        const backupService = new BackupService();

        const backups = await backupService.listBackups();

        // 获取每个备份的详细信息
        const backupDetails = await Promise.all(
            backups.map(async (file) => {
                try {
                    const info = await backupService.getBackupInfo(file);
                    return info;
                } catch {
                    return {
                        fileName: file,
                        metadata: null,
                        collections: [],
                        documentCounts: {}
                    };
                }
            })
        );

        return json({
            success: true,
            backups: backupDetails
        });
    } catch (error) {
        console.error('API Error:', error);
        return json({
            success: false,
            message: 'Failed to list backups',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};