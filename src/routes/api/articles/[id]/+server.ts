import { Articles } from "$lib/models";
import { requireUser, withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = withApi(async ({ params, locals }) => {
    const res = await Articles.getByArticleId(params.id, locals.user!);
    return json(res);
});

async function ensureCanEditArticle(user: any, articleId: string) {
    const target = await Articles.findOne(
        { id: articleId, isLatest: true },
        { projection: { _id: 0, authorId: 1 } }
    );

    if (!target) {
        return { ok: false, response: json({ message: "文章不存在" }, { status: 404 }) };
    }

    const isAdmin = user.roles?.includes("administrator");
    if (!isAdmin && target.authorId !== user.id) {
        return { ok: false, response: json({ message: "权限不足" }, { status: 403 }) };
    }

    return { ok: true as const };
}

export const POST: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    const { request, params } = event;

    const permission = await ensureCanEditArticle(user, params.id);
    if (!permission.ok) {
        return permission.response;
    }

    const body = await request.json();
    const res = await Articles.updateOne(
        { id: params.id, isLatest: true },
        {
            $set: {
                title: body.title,
                coverImage: body.coverImage,
                summary: body.summary,
                content: body.content,
            },
        }
    );

    return json(res);
});

export const PUT: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    const { request, params } = event;

    const permission = await ensureCanEditArticle(user, params.id);
    if (!permission.ok) {
        return permission.response;
    }

    const body = await request.json();
    if (!body.title || !body.content) {
        return json({ error: "缺少必填项" }, { status: 400 });
    }

    const { _id, ...rest } = body;
    const res = await Articles.updateOne(
        { id: params.id, isLatest: true },
        { $set: rest }
    );
    return json(res);
});
