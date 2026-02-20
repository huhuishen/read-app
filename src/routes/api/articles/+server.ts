import { Articles, type Article } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = withApi(async ({ url, locals }) => {

    if (!locals.user) {
        return json({ message: "未登录" }, { status: 401 });
    }

    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 12);
    const search = url.searchParams.get("q") ?? "";

    const isAdmin = locals.user.roles?.includes("administrator");

    const authorId = url.searchParams.get("authorId");

    const query =
        isAdmin
            ? {
                isLatest: true,
                ...(authorId ? { authorId } : {}),
                ...(search ? {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { author: { $regex: search, $options: "i" } }
                    ]
                } : {})
            }
            : {
                isLatest: true,
                // authorId: locals.user.id,
                ...(search ? {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { author: { $regex: search, $options: "i" } }
                    ]
                } : {})
            };

    const res = await Articles.findPage(
        query,
        { projection: { content: 0 } },
        { page, limit, sort: { createdAt: -1 } }
    );

    return json(res);
});


// 创建新书籍
// export const POST: RequestHandler = async ({ request }) => {

//     try {
//         const formData = await request.formData();

//         const title = formData.get('title') as string;
//         const author = formData.get('author') as string;
//         const content = formData.get('content') as string;
//         const bref = formData.get('description') as string;
//         const category = formData.get('category') as string;
//         const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [];
//         const isPublic = formData.get('isPublic') === 'true';
//         const uploader = formData.get('uploader') as string;

//         const coverImageFile = formData.get('coverImage') as File;

//         // 验证必填字段
//         if (!title || !author || !content || !uploader) {
//             throw error(400, 'Missing required fields');
//         }

//         let coverImagePath = '';

//         // 处理封面图片上传
//         if (coverImageFile && coverImageFile.size > 0) {
//             validateFile(coverImageFile, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024);
//             coverImagePath = await handleFileUpload(coverImageFile, 'covers');
//         }

//         const book: Partial<Article> = {
//             title,
//             author,
//             content,
//             bref,
//             tags,
//             coverImage: coverImagePath,
//             createdAt: new Date(),
//         }

//         await Articles.insertOne(book as any);

//         return json(book, { status: 201 });
//     } catch (err) {
//         if (err instanceof Error) {
//             throw error(400, err.message);
//         }
//         throw error(500, 'Failed to create book');
//     }
// };

export const POST: RequestHandler = async ({ request, params, cookies }) => {
    const req = await request.json();

    const article = req as Article;

    if (!article.title || !article.content) {
        return json({ error: '缺少必填项' }, { status: 400 });
    }

    article.bookmarkCount = 0;
    article.viewCount = 0;
    try {
        const res = await Articles.insertOne(article);
        return json({
            acknowledged: res.acknowledged,
            insertedId: res.insertedId
        }, { status: 200 });
    } catch (error) {
        return json({ error: JSON.stringify(error) }, { status: 500 });
    }
};