import { BackupService } from '$lib/server/backup';
import { requireRole, withApi } from '$lib/util/apiHandler';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const backupService = new BackupService();
    const backups = await backupService.listBackups();

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
});
