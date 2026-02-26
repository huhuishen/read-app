import { json, type RequestHandler } from '@sveltejs/kit';
import { BackupService } from '$lib/server/backup';

export const POST: RequestHandler = async ({ }) => {
    try {
        const backupService = new BackupService();

        const result = await backupService.backupDatabase();

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