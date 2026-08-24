import { Categories } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CATEGORY_UPDATE_FIELDS = [
    'description',
    'show',
    'award',
    'submissionStart',
    'submissionEnd',
    'voteEnd',
    'level',
    'order',
    'previewSize',
] as const;

function pickCategoryUpdate(body: Record<string, unknown>) {
    const update: Record<string, unknown> = {};

    for (const key of CATEGORY_UPDATE_FIELDS) {
        if (body[key] !== undefined) {
            update[key] = body[key];
        }
    }

    if (Object.keys(update).length === 0) {
        return json({ message: 'No updatable fields' }, { status: 400 });
    }

    return update;
}

export const GET: RequestHandler = async ({ url, ...event }) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 12);
    const name = url.searchParams.get('q') ?? '';

    const res = await Categories.findPage(
        { ...(name ? { name: { $regex: name, $options: 'i' } } : {}) },
        {},
        { page, limit, sort: { createdAt: -1 } }
    );

    return json(res);
};

export const PATCH: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const body = await event.request.json() as Record<string, unknown>;
    const name = body.name;

    if (typeof name !== 'string' || !name.trim()) {
        return json({ message: 'Category name is required' }, { status: 400 });
    }

    const update = pickCategoryUpdate(body);
    if (update instanceof Response) return update;

    const res = await Categories.updateOne(
        { name },
        { $set: update }
    );

    return json(res);
};

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const res = await Categories.createAward(2026, 2);

    return json(res);
};
