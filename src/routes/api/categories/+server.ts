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



// export async function POST({ request }) {
//     return await safe(async () => {
//         const req = await request.json();

//         if (!req.name) {
//             throw new SafeError(404, 'name not specfied');
//         }

//         const res = await Categories.build(req.name, req.size);

//         return new Response(JSON.stringify(res));
//     });
// }
