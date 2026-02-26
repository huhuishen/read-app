import { Categories } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// export async function GET({ params }) {
//     return await safe(async () => {
//         const res = await Categories.at(params.name);
//         if (!res) {
//             throw new SafeError(404, 'Categories not found');
//         }

//         return new Response(JSON.stringify(res));
//     });
// }

export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const category = await Categories.findOne(
        { name: params.name },
    );

    return json(category);
});
