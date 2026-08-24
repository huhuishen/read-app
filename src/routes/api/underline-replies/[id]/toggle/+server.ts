import { CommentLikes } from '$lib/models/commentLike.js';
import { UnderlineReplies } from '$lib/models/underlineReply';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';



export const POST: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) return json({ message: "登录信息为空" }, { status: 400 });

    const res = await CommentLikes.toggleLike(params.id, locals.user.id!, locals.user.name!, UnderlineReplies);

    return json(res);
};
