import { json, type RequestHandler } from '@sveltejs/kit';
import { BackupService } from '$lib/server/backup';
import { requireRole, withApi } from '$lib/util/apiHandler';

export const POST: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const backupService = new BackupService();
    const result = await backupService.backupDatabase();

    return json(result);
});
