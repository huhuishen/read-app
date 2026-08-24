import { ArticleUserStats } from '$lib/models/articleStats';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const POST: RequestHandler = async ({ request, locals, params }) => {
    if (!locals.user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    const req: { value?: unknown } = await request.json();
    if (typeof req.value !== "boolean") {
        throw new Error("Invalid vote payload");
    }

    const r = await ArticleUserStats.voteArticle(locals.user?.id!, params.id, req.value);

    return json(r);
};

// api.post(`/api/articles/${article.id}/stats`, {
//     action: "vote",
//     value: !article.voted,
// }),voteArticle
