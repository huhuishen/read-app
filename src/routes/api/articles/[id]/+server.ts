import { Articles, type Article } from "$lib/models";
import { withApi } from "$lib/util/apiHandler";
import { safe } from "$lib/util/safe";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = withApi(async ({ params, locals }) => {
    // if (!locals.user) {
    //     return json({ message: "未登录" }, { status: 401 });
    // }

    const res = await Articles.getByArticleId(params.id, locals.user!);
    return json(res);
});

export const POST = withApi(async ({ request, params }) => {
    const body = await request.json();
    const res = await Articles.updateOneById(body._id, {
        $set: {
            title: body.title,
            coverImage: body.coverImage,
            summary: body.summary,
            content: body.content,
        }
    });

    return json(res);
})

// export const POST: RequestHandler = async ({ request, params, cookies }) => {
//     return await safe(async () => {
//         const req = await request.json();

//         const article = req as Article;
//         const id = article._id!.toString();
//         const { ["_id"]: excluded, ...rest } = article;

//         if (!article.title || !article.content) {
//             return json({ error: '缺少必填项' }, { status: 400 });
//         }

//         const res = await Articles.updateOneById(id, { $set: rest });
//         return new Response(JSON.stringify(res));
//     })
// };

export const PUT: RequestHandler = async ({ request, params, cookies }) => {
    return await safe(async () => {
        const req = await request.json();

        const article = req as Article;
        const id = article._id!.toString();
        const { ["_id"]: excluded, ...rest } = article;

        if (!article.title || !article.content) {
            return json({ error: '缺少必填项' }, { status: 400 });
        }

        const res = await Articles.updateOneById(id, { $set: rest });
        return new Response(JSON.stringify(res));
    })
};