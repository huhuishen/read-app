import { Articles } from "$lib/models";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    const articles = await Articles.findPage(
        { tags: params.name, isLatest: true, status: "published" },
        { projection: { _id: 0, content: 0 } },
        { page, limit, sort: { createdAt: -1 } },
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
