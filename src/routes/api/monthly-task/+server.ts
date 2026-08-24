import { getDb } from '$lib/models';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });
    const db = getDb();

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
};
