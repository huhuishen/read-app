import { Articles, Users, type Article } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = withApi(async ({ url, locals }) => {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');

    if (!locals.user?.roles?.includes("administrator")) {
        return json({ message: "无管理员权限" }, { status: 400 })
    }

    const res = await Users.findPage(
        {},
        {},
        { page, limit, sort: { createdAt: -1 } }
    );
    return json(res);
});