import { Articles } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    const articles = await Articles.findPage(
        { categories: params.name, isLatest: true, status: "published" },
        { projection: { _id: 0, content: 0 } },
        { page, limit, sort: { createdAt: -1 } }
    );

    return json(articles);
});
