import { db } from '$lib/models';
import { requireRole, withApi } from '$lib/util/apiHandler';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const today = new Date().toISOString().slice(0, 7);

    const exists = await db.collection('task_logs').findOne({
        type: 'monthly',
        month: today
    });

    if (exists) {
        return json({ ok: true, skipped: true });
    }

    await db.collection('task_logs').insertOne({
        type: 'monthly',
        month: today,
        createdAt: new Date()
    });

    return json({ ok: true });
});
