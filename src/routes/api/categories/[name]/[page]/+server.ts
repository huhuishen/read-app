import { Articles } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 获取所有书籍
// export const GET: RequestHandler = async ({ url, cookies, params }) => {
//     return await safe(async () => {
//         // const name = url.searchParams.get('name')
//         // const page = url.searchParams.get('page')
//         const name = params.name;
//         const page = params.page;
//         // const user = getUser(cookies);

//         // if (!user?.id || !name || !page) {
//         //     throw new SafeError(401, '必须提供用户、分类名称及页号');
//         // }

//         const data = await Articles.listByCategory(name, parseInt(page), 25);

//         return new Response(JSON.stringify(data));
//     });
// };

export const GET: RequestHandler = withApi(async ({ params }) => {
    const data = await Articles.listByCategory(params.name, parseInt(params.page), 25);

    return json(data);
});
