import { json, type RequestHandler } from '@sveltejs/kit';
import { BackupService } from '$lib/server/backup';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const backupService = new BackupService();
    const result = await backupService.backupDatabase();

    return json(result);
};
