import { Comments } from '$lib/models';
import { CommentLikes } from '$lib/models/commentLike.js';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';



export const POST: RequestHandler = withApi(async ({ params, locals }) => {
    if (!locals.user) return json({ message: "登录信息为空" }, { status: 400 });

    const res = await CommentLikes.toggleLike(params.id, locals.user.id!, locals.user.name!, Comments);

    return json(res);
});
