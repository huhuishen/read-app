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

const ARTICLE_STATUSES = ['草稿', '待审核', '上架', '下架'] as const;
type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

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

function normalizeStatus(value: unknown): ArticleStatus {
    if (typeof value !== "string" || !ARTICLE_STATUSES.includes(value as ArticleStatus)) {
        apiError(400, "Invalid article status");
    }
    return value as ArticleStatus;
}

async function ensureCanEditArticle(
    user: any,
    articleId: string,
    { allowReviewer = false }: { allowReviewer?: boolean } = {}
) {
    const target = await Articles.findOne(
        { id: articleId, isLatest: true },
        { projection: { _id: 0, authorId: 1, author: 1, status: 1, tags: 1, title: 1, coverImage: 1, category: 1 } }
    );

    if (!target) {
        apiError(404, 'Article not found');
    }

    const isAdmin = user.roles?.includes('administrator');
    const isEditor = user.roles?.includes('editor');
    const canReview = allowReviewer && isEditor;

    if (!isAdmin && !canReview && target.authorId !== user.id) {
        apiError(403, 'Forbidden');
    }

    return target;
}

type statusRule = {
    current: ArticleStatus;
    next: ArticleStatus;
    roles: string[];
};

const STATUS_RULES: statusRule[] = [
    { current: '草稿', next: '待审核', roles: [] },
    { current: '待审核', next: '草稿', roles: ['administrator', 'editor'] },
    { current: '待审核', next: '上架', roles: ['administrator', 'editor'] },
    { current: '上架', next: '下架', roles: ['administrator', 'editor'] },
    { current: '下架', next: '上架', roles: ['administrator', 'editor'] },
    { current: '下架', next: '待审核', roles: [] },
];

function enforceStatusTransition(
    user: any,
    target: { status?: string },
    update: Record<string, unknown>
): boolean {
    // 允许无状态转换
    if (!Object.prototype.hasOwnProperty.call(update, 'status')) {
        return true;
    }

    const currentStatus = normalizeStatus(target.status ?? '草稿');
    const nextStatus = normalizeStatus(update.status);

    // 允许状态转换到相同状态
    if (currentStatus === nextStatus) {
        return true;
    }

    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];

    return STATUS_RULES.some((rule) => {
        if (rule.current !== currentStatus || rule.next !== nextStatus) {
            return false;
        }

        // roles = [] 时，无权限要求
        if (rule.roles.length === 0) {
            return true;
        }

        return rule.roles.some((role) => userRoles.includes(role));
    });
}

function sanitizeUpdateByRole(
    user: any,
    target: { authorId?: string },
    update: Record<string, unknown>
) {
    const isAdmin = user.roles?.includes('administrator');
    const isOwner = target.authorId === user.id;
    const isEditor = user.roles?.includes('editor');

    if (isAdmin || isOwner || !isEditor) {
        return update;
    }

    // Editors in review flow can adjust metadata and status only.
    delete update.title;
    delete update.content;

    if (Object.keys(update).length === 0) {
        apiError(400, 'No permitted fields for reviewer');
    }

    return update;
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

async function syncCategoryPreviewCacheOnUnpublish(
    articleId: string,
    oldStatus: string | undefined,
    update: Record<string, unknown>
) {
    if (!Object.prototype.hasOwnProperty.call(update, 'status')) {
        return;
    }

    const currentStatus = normalizeStatus(oldStatus ?? '草稿');
    const nextStatus = normalizeStatus(update.status);

    if (currentStatus === nextStatus || nextStatus !== '下架') {
        return;
    }

    await Categories.updateMany(
        { 'previewArticles.id': articleId },
        { $pull: { previewArticles: { id: articleId } } }
    );
}

function getCategoryPeriodFromUpdate(update: Record<string, unknown>, fallback?: string) {
    const category = update.category;
    if (category && typeof category === 'object' && 'period' in category) {
        const period = (category as { period?: unknown }).period;
        if (typeof period === 'string' && period.trim()) {
            return period.trim();
        }
    }
    return fallback;
}

async function syncCategoryPreviewCacheOnPublish(
    articleId: string,
    target: { status?: string; title?: string; coverImage?: string; author?: string; category?: { period?: string } },
    update: Record<string, unknown>
) {
    if (!Object.prototype.hasOwnProperty.call(update, 'status')) {
        return;
    }

    const currentStatus = normalizeStatus(target.status ?? '草稿');
    const nextStatus = normalizeStatus(update.status);

    if (currentStatus === nextStatus || nextStatus !== '上架') {
        return;
    }

    const categoryPeriod = getCategoryPeriodFromUpdate(update, target.category?.period);
    if (!categoryPeriod) {
        return;
    }

    const title = Object.prototype.hasOwnProperty.call(update, 'title')
        ? String(update.title ?? '')
        : (target.title ?? '');
    const coverImage = Object.prototype.hasOwnProperty.call(update, 'coverImage')
        ? String(update.coverImage ?? '')
        : (target.coverImage ?? '');

    await Categories.updateOne(
        { name: categoryPeriod, 'previewArticles.id': { $ne: articleId } },
        {
            $push: {
                previewArticles: {
                    $each: [{
                        id: articleId,
                        title,
                        coverImage,
                        author: target.author ?? '',
                    }],
                    $position: 0,
                }
            }
        }
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

    const target = await ensureCanEditArticle(user, params.id, { allowReviewer: true });

    const body = await request.json() as Record<string, unknown>;
    const rawUpdate = pickArticleUpdate(body, false);
    if (!enforceStatusTransition(user, target, rawUpdate)) {
        apiError(403, 'Invalid status transition');
    }
    const update = sanitizeUpdateByRole(user, target, rawUpdate);

    const res = await Articles.updateOne(
        { id: params.id, isLatest: true },
        {
            $set: update,
        }
    );

    await syncCategoryPreviewCache(params.id, target.title, target.coverImage, update);
    await syncCategoryPreviewCacheOnPublish(params.id, target, update);
    await syncCategoryPreviewCacheOnUnpublish(params.id, target.status, update);

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
