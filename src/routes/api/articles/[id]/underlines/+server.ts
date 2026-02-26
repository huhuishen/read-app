import { UnderlineComments, type UnderlineComment } from '$lib/models/underlineComments';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UnderlineReplies } from '$lib/models/underlineReply';
import { CommentLikes } from '$lib/models/commentLike';



export const GET: RequestHandler = withApi(async ({ params, url, locals }) => {
    const segment = url.searchParams.get('segment');
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    if (!segment) return json([]);

    let roots;

    if (!start || !end) return json({ message: "未指定划线评论的段内范围信息" }, { status: 400 });

    roots = await UnderlineComments.find({
        articleId: params.id,
        segment: parseInt(segment),
        start: { $gte: parseInt(start) },
        end: { $lte: parseInt(end) }
    }, {
        sort: { createdAt: -1 }
    }).toArray();


    // 2 查所有 replies（批量）
    const rootIds = roots.map(c => c._id);

    const replies = await UnderlineReplies.find(
        { parentId: { $in: rootIds } },
        { sort: { createdAt: -1 } }
    ).toArray();

    // 3 一次性查「当前用户的所有点赞」
    const allCommentIds = [
        ...rootIds,
        ...replies.map(r => r._id)
    ];

    const likes = await CommentLikes.find(
        {
            commentId: { $in: allCommentIds },
            userId: locals.user?.id
        },
        { projection: { commentId: 1 } }
    ).toArray();

    const likedSet = new Set(
        likes.map(l => l.commentId.toString())
    );

    // 4 组装 replies（O(n)）
    const replyMap = new Map<string, any[]>();

    for (const r of replies) {
        const pid = r.parentId!.toString();
        if (!replyMap.has(pid)) {
            replyMap.set(pid, []);
        }

        replyMap.get(pid)!.push({
            ...r,
            liked: likedSet.has(r._id.toString())
        });
    }

    // 5 组装最终评论结构（完成）
    const result = roots.map(c => ({
        ...c,
        liked: likedSet.has(c._id.toString()),
        replies: replyMap.get(c._id.toString()) ?? []
    }));

    return json(result);


    // } else {
    //     underlines = await UnderlineComments.find({
    //         articleId: params.id,
    //         segment: parseInt(segment)
    //     }).toArray();
    // }

    // return json(underlines);
});

export const POST = withApi(async ({ request, locals }) => {
    const req = await request.json() as UnderlineComment;
    const res = await UnderlineComments.add(req);

    return json(res);
});

