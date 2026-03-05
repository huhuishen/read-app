import { Tags } from '$lib/models';
import { apiError, requireRole, withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function normalizeName(value: unknown, field = '标签名称') {
    if (typeof value !== 'string' || !value.trim()) {
        apiError(400, `${field}不能为空`);
    }

    return value.trim();
}

export const GET: RequestHandler = withApi(async ({ url, ...event }) => {
    requireRole(event, 'administrator');

    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const name = (url.searchParams.get('q') ?? '').trim();

    const res = await Tags.findPage(
        { ...(name ? { name: { $regex: name, $options: 'i' } } : {}) },
        {},
        { page, limit, sort: { createdAt: -1 } },
    );

    return json(res);
});

export const POST: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const body = (await event.request.json()) as Record<string, unknown>;

    const name = normalizeName(body.name);
    const show = body.show === undefined ? true : Boolean(body.show);

    const exists = await Tags.findOne({ name });
    if (exists) {
        apiError(400, '标签已存在');
    }

    const res = await Tags.insertOne({
        name,
        show,
        articleCount: 0,
    });

    return json(res);
});

export const PATCH: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const body = (await event.request.json()) as Record<string, unknown>;
    const oldName = normalizeName(body.oldName, '旧标签名称');

    const update: Record<string, unknown> = {};

    if (body.name !== undefined) {
        update.name = normalizeName(body.name);
    }

    if (body.show !== undefined) {
        update.show = Boolean(body.show);
    }

    if (Object.keys(update).length === 0) {
        apiError(400, '没有可更新字段');
    }

    const res = await Tags.updateOne({ name: oldName }, { $set: update });

    if (res.matchedCount === 0) {
        apiError(404, '标签不存在');
    }

    return json(res);
});

export const DELETE: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const body = (await event.request.json()) as Record<string, unknown>;
    const name = normalizeName(body.name);

    const tag = await Tags.findOne({ name });

    if (!tag) {
        apiError(404, '标签不存在');
    }

    if ((tag.articleCount ?? 0) > 0) {
        apiError(400, '标签有关联文章，无法删除');
    }

    const res = await Tags.deleteOne({ name });

    return json(res);
});
