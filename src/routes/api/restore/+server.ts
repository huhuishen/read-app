import { json, type RequestHandler } from '@sveltejs/kit';
import { RestoreService } from '$lib/server/restore';
import { requireRole, withApi } from '$lib/util/apiHandler';

export const POST: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const data = await event.request.json();
    const { backupFile, collections, dropExisting } = data;

    if (!backupFile) {
        return json({
            success: false,
            message: 'Backup file is required'
        }, { status: 400 });
    }

    const restoreService = new RestoreService();
    const result = await restoreService.restoreDatabase({
        backupFile,
        collections,
        dropExisting: dropExisting || false
    });

    return json(result);
});
