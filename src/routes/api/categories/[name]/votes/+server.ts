import { Articles } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const articles = await Articles.find(
        { categories: params.name, isLatest: true, status: "published" },
        {
            projection: { _id: 0, content: 0, summary: 0 },
            sort: { voteCount: -1 }
        },
    ).toArray();

    return json(articles);
});
