import { Tags } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function normalizeName(value: unknown, field = '标签名称') {
    if (typeof value !== 'string' || !value.trim()) {
        return json({ message: `${field}不能为空` }, { status: 400 });
    }

    return value.trim();
}

export const GET: RequestHandler = async ({ url, ...event }) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const name = (url.searchParams.get('q') ?? '').trim();

    const res = await Tags.findPage(
        { ...(name ? { name: { $regex: name, $options: 'i' } } : {}) },
        {},
        { page, limit, sort: { createdAt: -1 } },
    );

    return json(res);
};

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const body = (await event.request.json()) as Record<string, unknown>;

    const name = normalizeName(body.name);
    if (name instanceof Response) return name;
    const show = body.show === undefined ? true : Boolean(body.show);

    const exists = await Tags.findOne({ name });
    if (exists) {
        return json({ message: '标签已存在' }, { status: 400 });
    }

    const res = await Tags.insertOne({
        name,
        show,
        articleCount: 0,
    });

    return json(res);
};

export const PATCH: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const body = (await event.request.json()) as Record<string, unknown>;
    const oldName = normalizeName(body.oldName, '旧标签名称');
    if (oldName instanceof Response) return oldName;

    const update: Record<string, unknown> = {};

    if (body.name !== undefined) {
        const normalizedName = normalizeName(body.name);
        if (normalizedName instanceof Response) return normalizedName;
        update.name = normalizedName;
    }

    if (body.show !== undefined) {
        update.show = Boolean(body.show);
    }

    if (Object.keys(update).length === 0) {
        return json({ message: '没有可更新字段' }, { status: 400 });
    }

    const res = await Tags.updateOne({ name: oldName }, { $set: update });

    if (res.matchedCount === 0) {
        return json({ message: '标签不存在' }, { status: 404 });
    }

    return json(res);
};

export const DELETE: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const body = (await event.request.json()) as Record<string, unknown>;
    const name = normalizeName(body.name);
    if (name instanceof Response) return name;

    const tag = await Tags.findOne({ name });

    if (!tag) {
        return json({ message: '标签不存在' }, { status: 404 });
    }

    if ((tag.articleCount ?? 0) > 0) {
        return json({ message: '标签有关联文章，无法删除' }, { status: 400 });
    }

    const res = await Tags.deleteOne({ name });

    return json(res);
};
