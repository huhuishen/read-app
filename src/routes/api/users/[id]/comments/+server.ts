import { Comments } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    const comments = await Comments.findPage(
        {
            userId: params.id,
        },
        {},
        { page, limit, sort: { createdAt: -1 } }
    );

    return json(comments);
});
