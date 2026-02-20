import { Articles } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    const articles = await Articles.findPage(
        {
            authorId: params.id,
            isLatest: true,
            status: "published",
        },
        { projection: { content: 0 } },
        { page, limit, sort: { createdAt: -1 } }
    );


    // const articleMap = new Map(
    //     articles.map(s => [s.id, s])
    // );

    // // 合并
    // const merged = stats.items.map(stats => ({
    //     ...articleMap.get(stats.articleId),
    //     stats: stats
    // }));

    return json(articles);
});
