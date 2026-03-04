import { Categories } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sanitizeCategoryPreviewAuthors } from '../util';


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const category = await Categories.findOne(
        { name: params.name },
    );

    if (!category) {
        return json(category);
    }

    return json(sanitizeCategoryPreviewAuthors(category));
});

export const POST: RequestHandler = withApi(async ({ params, locals, url }) => {
    const category = await Categories.buildPreview(
        params.name
    );

    return json(category);
});
