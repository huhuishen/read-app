import { ArticleUserStats } from '$lib/models/articleStats';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const POST: RequestHandler = withApi(async ({ request, locals, params }) => {
    const req: { action: "bookmark" | "vote" | "read", value: any, completion?: number }
        = await request.json();

    await ArticleUserStats.setState(
        params.id,
        locals.user?.id!,
        req.action,
        req.value,
        req.completion);

    return json({ ok: true });
});