import { Categories } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const category = await Categories.findOne(
        { name: params.name },
    );

    return json(category);
});

export const POST: RequestHandler = withApi(async ({ params, locals, url }) => {
    const category = await Categories.buildPreview(
        params.name
    );

    return json(category);
});
