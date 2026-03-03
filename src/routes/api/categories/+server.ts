import { Categories } from '$lib/models';
import { apiError, requireRole, withApi } from '$lib/util/apiHandler';
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
        apiError(400, 'No updatable fields');
    }

    return update;
}

export const GET: RequestHandler = withApi(async ({ url, ...event }) => {
    requireRole(event, 'administrator');

    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 12);
    const name = url.searchParams.get('q') ?? '';

    const res = await Categories.findPage(
        { ...(name ? { name: { $regex: name, $options: 'i' } } : {}) },
        {},
        { page, limit, sort: { createdAt: -1 } }
    );

    return json(res);
});

export const PATCH: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const body = await event.request.json() as Record<string, unknown>;
    const name = body.name;

    if (typeof name !== 'string' || !name.trim()) {
        apiError(400, 'Category name is required');
    }

    const update = pickCategoryUpdate(body);

    const res = await Categories.updateOne(
        { name },
        { $set: update }
    );

    return json(res);
});

export const POST: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const res = await Categories.createAward(2026, 2);

    return json(res);
});
