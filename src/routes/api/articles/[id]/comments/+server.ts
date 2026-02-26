import { Comments, type Comment } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = withApi(async ({ params, url, locals }) => {
    const res = await Comments.get(params.id, locals.user?.id!);
    return json(res);
});

export const POST = withApi(async ({ request, locals }) => {
    const req = await request.json() as Comment;
    const res = await Comments.add(req, locals.user);
    return json(res);
});

// const cursor = Comments.find({})
// while (await cursor.hasNext()) {
//     const doc = await cursor.next();
//     if (!doc) continue;

//     let res = await Comments.updateOne(
//         { _id: doc._id },
//         {
//             $rename: { "authorId": "userId", "author": "user" },
//         }
//     );
// };

// return new Response(JSON.stringify({ ok: true }));