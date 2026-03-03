import { Articles } from '$lib/models';
import { apiError, requireUser, withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ARTICLE_UPDATE_FIELDS = [
    'title',
    'coverImage',
    'summary',
    'content',
    'tags',
    'status',
    'category',
] as const;

function pickArticleUpdate(body: Record<string, unknown>, requireTitleAndContent: boolean) {
    const update: Record<string, unknown> = {};

    for (const key of ARTICLE_UPDATE_FIELDS) {
        if (body[key] !== undefined) {
            update[key] = body[key];
        }
    }

    if (requireTitleAndContent) {
        if (!update.title || !update.content) {
            apiError(400, 'Missing required fields');
        }
    }

    if (Object.keys(update).length === 0) {
        apiError(400, 'No updatable fields');
    }

    return update;
}

async function ensureCanEditArticle(user: any, articleId: string) {
    const target = await Articles.findOne(
        { id: articleId, isLatest: true },
        { projection: { _id: 0, authorId: 1 } }
    );

    if (!target) {
        apiError(404, 'Article not found');
    }

    const isAdmin = user.roles?.includes('administrator');
    if (!isAdmin && target.authorId !== user.id) {
        apiError(403, 'Forbidden');
    }
}

export const GET: RequestHandler = withApi(async ({ params, locals }) => {
    const res = await Articles.getByArticleId(params.id, locals.user!);
    return json(res);
});

export const POST: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    const { request, params } = event;

    await ensureCanEditArticle(user, params.id);

    const body = await request.json() as Record<string, unknown>;
    const update = pickArticleUpdate(body, false);

    const res = await Articles.updateOne(
        { id: params.id, isLatest: true },
        {
            $set: update,
        }
    );

    return json(res);
});

export const PUT: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    const { request, params } = event;

    await ensureCanEditArticle(user, params.id);

    const body = await request.json() as Record<string, unknown>;
    const update = pickArticleUpdate(body, true);

    const res = await Articles.updateOne(
        { id: params.id, isLatest: true },
        { $set: update }
    );

    return json(res);
});
