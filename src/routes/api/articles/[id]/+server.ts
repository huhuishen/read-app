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

const ARTICLE_STATUSES = ["草稿", "待审核", "上架", "下架"] as const;
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
        { projection: { _id: 0, authorId: 1, status: 1, tags: 1, title: 1, coverImage: 1, category: 1 } }
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

function enforceStatusTransition(
    user: any,
    target: { authorId?: string; status?: string },
    update: Record<string, unknown>
) {
    if (!Object.prototype.hasOwnProperty.call(update, "status")) {
        return;
    }

    const currentStatus = normalizeStatus(target.status ?? "草稿");
    const nextStatus = normalizeStatus(update.status);

    if (currentStatus === nextStatus) {
        return;
    }

    const isAdmin = user.roles?.includes("administrator");
    const isEditor = user.roles?.includes("editor");
    const isOwner = target.authorId === user.id;
    const hasEditorPermission = isAdmin || isEditor;

    const canSubmitForReview =
        isOwner &&
        (currentStatus === "草稿" || currentStatus === "下架") &&
        nextStatus === "待审核";
    const canReviewDecision =
        hasEditorPermission &&
        currentStatus === "待审核" &&
        (nextStatus === "草稿" || nextStatus === "上架");
    const canTakeDown =
        (isOwner || hasEditorPermission) &&
        currentStatus === "上架" &&
        nextStatus === "下架";

    if (!canSubmitForReview && !canReviewDecision && !canTakeDown) {
        apiError(403, "Invalid status transition");
    }
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
    enforceStatusTransition(user, target, rawUpdate);
    const update = sanitizeUpdateByRole(user, target, rawUpdate);

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
