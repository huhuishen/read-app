import { Articles, Categories } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const name = await Categories.resolveName(params.name);

    const articles = await Articles.findPage(
        { "category.period": name, isLatest: true, status: "上架" },
        { projection: { _id: 0, content: 0 } },
        { page, limit, sort: { createdAt: -1 } }
    );

    const now = Date.now();

    articles.items.forEach(article => {
        if (now < article.category.voteEnd.getTime()) {
            delete article.author;
            delete article.authorId;
        }
    });

    return json(articles);
});
