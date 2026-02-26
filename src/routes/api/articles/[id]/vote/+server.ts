import { ArticleUserStats } from '$lib/models/articleStats';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const POST: RequestHandler = withApi(async ({ request, locals, params }) => {
    const req: { value: any } = await request.json();

    const r = await ArticleUserStats.voteArticle(locals.user?.id!, params.id, req.value);

    return json(r);
});

// api.post(`/api/articles/${article.id}/stats`, {
//     action: "vote",
//     value: !article.voted,
// }),voteArticle