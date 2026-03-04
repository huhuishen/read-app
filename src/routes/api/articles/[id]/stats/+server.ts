import {
    type ArticleStatsSetRequest,
    ArticleUserStats,
} from '$lib/models/articleStats';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const POST: RequestHandler = withApi(async ({ request, locals, params }) => {
    const body = await request.json();
    let req: ArticleStatsSetRequest;

    if (body?.action === "bookmark" && typeof body?.value === "boolean") {
        req = { action: "bookmark", value: body.value };
    } else if (body?.action === "vote" && typeof body?.value === "boolean") {
        req = { action: "vote", value: body.value };
    } else if (
        body?.action === "read"
        && typeof body?.value === "number"
        && (body?.completion === undefined || typeof body?.completion === "number")
    ) {
        req = { action: "read", value: body.value, completion: body.completion };
    } else {
        throw new Error("Invalid request payload");
    }

    await ArticleUserStats.setState(
        params.id,
        locals.user?.id!,
        req,
    );

    return json({ ok: true });
});

// api.post(`/api/articles/${article.id}/stats`, {
//     action: "vote",
//     value: !article.voted,
// }),voteArticle
