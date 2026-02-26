import { Categories } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = withApi(async ({ url, locals }) => {
    if (!locals.user || !locals.user.roles?.includes("administrator")) {
        return json({ message: "权限不足" }, { status: 401 });
    }

    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 12);
    const name = url.searchParams.get("q") ?? "";

    const res = await Categories.findPage(
        { ...(name ? { name: { $regex: name, $options: "i" } } : {}) },
        {},
        { page, limit, sort: { createdAt: -1 } }
    );

    return json(res);
});


export const PATCH: RequestHandler = withApi(async ({ request }) => {
    const body = await request.json();

    const res = await Categories.updateOne(
        { name: body.name },
        { $set: body }
    );

    return json(res);
})

export const POST: RequestHandler = withApi(async ({ request }) => {
    const res = await Categories.createAward(2026, 2);

    return json(res);
})
