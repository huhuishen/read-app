import { Articles, Categories, Tags } from '$lib/models';
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

    if (Array.isArray(update.tags)) {
        update.tags = update.tags
            .map((item) => String(item).trim())
            .filter(Boolean);
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
        { projection: { _id: 0, authorId: 1, tags: 1, title: 1, coverImage: 1, category: 1 } }
    );

    if (!target) {
        apiError(404, 'Article not found');
    }

    const isAdmin = user.roles?.includes('administrator');
    if (!isAdmin && target.authorId !== user.id) {
        apiError(403, 'Forbidden');
    }

    return target;
}

async function syncCategoryPreviewCache(
    articleId: string,
    oldTitle: string | undefined,
    oldCoverImage: string | undefined,
    update: Record<string, unknown>
) {
    const hasTitleUpdate = Object.prototype.hasOwnProperty.call(update, 'title');
    const hasCoverUpdate = Object.prototype.hasOwnProperty.call(update, 'coverImage');

    if (!hasTitleUpdate && !hasCoverUpdate) {
        return;
    }

    const nextTitle = hasTitleUpdate ? String(update.title ?? '') : oldTitle ?? '';
    const nextCoverImage = hasCoverUpdate ? String(update.coverImage ?? '') : oldCoverImage ?? '';

    const titleChanged = hasTitleUpdate && nextTitle !== (oldTitle ?? '');
    const coverChanged = hasCoverUpdate && nextCoverImage !== (oldCoverImage ?? '');

    if (!titleChanged && !coverChanged) {
        return;
    }

    const previewPatch: Record<string, string> = {};
    if (titleChanged) {
        previewPatch['previewArticles.$[preview].title'] = nextTitle;
    }
    if (coverChanged) {
        previewPatch['previewArticles.$[preview].coverImage'] = nextCoverImage;
    }

    await Categories.updateMany(
        { 'previewArticles.id': articleId },
        { $set: previewPatch },
        { arrayFilters: [{ 'preview.id': articleId }] }
    );
}

async function syncCategoryCacheOnDelete(
    articleId: string,
    categoryPeriod?: string
) {
    if (categoryPeriod) {
        await Categories.updateOne(
            { name: categoryPeriod },
            {
                $inc: { articleCount: -1 },
                $pull: { previewArticles: { id: articleId } },
            }
        );
    }

    await Categories.updateMany(
        { 'previewArticles.id': articleId },
        { $pull: { previewArticles: { id: articleId } } }
    );
}

async function syncTags(oldTags: string[] = [], nextTags: string[] = []) {
    const normalize = (tags: string[] = []) =>
        [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
    const affectedTags = [...new Set([...normalize(oldTags), ...normalize(nextTags)])];
    await Promise.all(affectedTags.map((tag) => Tags.buildCount(tag)));
}

export const GET: RequestHandler = withApi(async ({ params, locals }) => {
    const data = await Articles.getByArticleId(params.id, locals.user!);
    const now = Date.now();

    if (now < data.article.category.voteEnd.getTime()) {
        delete data.article.author;
        // delete data.article.authorId;
    }

    return json(data);
});

export const POST: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    const { request, params } = event;

    const target = await ensureCanEditArticle(user, params.id);

    const body = await request.json() as Record<string, unknown>;
    const update = pickArticleUpdate(body, false);

    const res = await Articles.updateOne(
        { id: params.id, isLatest: true },
        {
            $set: update,
        }
    );

    await syncCategoryPreviewCache(params.id, target.title, target.coverImage, update);

    const oldTags = target.tags ?? [];
    const nextTags = Array.isArray(update.tags) ? (update.tags as string[]) : oldTags;
    await syncTags(oldTags, nextTags);

    return json(res);
});

export const PUT: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    const { request, params } = event;

    const target = await ensureCanEditArticle(user, params.id);

    const body = await request.json() as Record<string, unknown>;
    const update = pickArticleUpdate(body, true);

    const res = await Articles.updateOne(
        { id: params.id, isLatest: true },
        { $set: update }
    );

    await syncCategoryPreviewCache(params.id, target.title, target.coverImage, update);

    const oldTags = target.tags ?? [];
    const nextTags = Array.isArray(update.tags) ? (update.tags as string[]) : oldTags;
    await syncTags(oldTags, nextTags);

    return json(res);
});

export const DELETE: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    const { params } = event;

    const target = await ensureCanEditArticle(user, params.id);

    const res = await Articles.deleteMany({ id: params.id });

    await syncCategoryCacheOnDelete(params.id, target.category?.period);
    await syncTags(target.tags ?? [], []);

    return json(res);
});
