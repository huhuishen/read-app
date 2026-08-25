import { Articles, Categories, type Article } from "$lib/models";
import { json } from "@sveltejs/kit";
import type { Filter } from "mongodb";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const name = await Categories.resolveName(params.name);

    const isAdministrator = locals.user?.roles?.includes("administrator");
    const isEditor = locals.user?.roles?.includes("editor");
    const privilegedStatuses = ["published", "待审核", "下架"] as const;

    const query: Filter<Article> =
        isAdministrator || isEditor
            ? {
                "category.period": name,
                isLatest: true,
                status: { $in: privilegedStatuses },
            }
            : {
                "category.period": name,
                isLatest: true,
                status: "published" as const,
            };

    const articles = await Articles.findPage(
        query,
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
};
