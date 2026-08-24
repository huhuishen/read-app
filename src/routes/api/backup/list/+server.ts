import { BackupService } from '$lib/server/backup';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

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
};
