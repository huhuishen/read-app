import { json, type RequestHandler } from '@sveltejs/kit';
import { RestoreService } from '$lib/server/restore';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
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
    } catch (error) {
        console.error('API Error:', error);
        return json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};