import { Articles, Categories } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const name = await Categories.resolveName(params.name);

    const category = await Categories.findOne(
        { name },
    );

    if (!category || !category.voteEnd) return json({ message: "找不到指定的目录" }, { status: 404 });

    const now = new Date();
    const voteEnd = now > new Date(category.voteEnd);

    if (!voteEnd) return json(null);

    const articles = await Articles.find(
        { "category.period": name, isLatest: true, status: "published" },
        {
            projection: { _id: 0, content: 0, summary: 0 },
        },
    ).sort({ "stats.vote": -1 }).toArray();

    // const items = articles
    //     .map((item) => ensureArticleStats(item as any))
    //     .sort((a, b) => b.stats.vote - a.stats.vote);

    return json(articles);
});
