import { Articles, Categories } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {

    const category = await Categories.findOne(
        { name: params.name },
    );

    if (!category || !category.voteEnd) return json({ message: "找不到指定的目录" }, { status: 404 });

    const now = new Date();
    const voteEnd = now > new Date(category.voteEnd);

    if (!voteEnd) return json(null);

    const articles = await Articles.find(
        { categories: params.name, isLatest: true, status: "published" },
        {
            projection: { _id: 0, content: 0, summary: 0 },
            sort: { voteCount: -1 }
        },
    ).toArray();

    return json(articles);
});
