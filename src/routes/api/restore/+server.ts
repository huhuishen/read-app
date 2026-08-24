import { json, type RequestHandler } from '@sveltejs/kit';
import { RestoreService } from '$lib/server/restore';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

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
};
