import { Articles } from "$lib/models";
import { ArticleUserStats } from "$lib/models/articleStats";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    const stats = await ArticleUserStats.findPage(
        {
            userId: params.id,
            action: "read"
        },
        {},
        { page, limit, sort: { updatedAt: -1 } }
    );

    const articleIds = stats.items.map(s => s.articleId);

    const articles = await Articles.find(
        { id: { $in: articleIds } },
        { projection: { content: 0 } }
    ).toArray();

    // 改为客户端合并
    // const articleMap = new Map(
    //     articles.map(s => [s.id, s])
    // );

    // // 合并
    // const merged = stats.items.map(stats => ({
    //     ...articleMap.get(stats.articleId),
    //     stats: stats
    // }));

    return json({ stats, articles });
});
