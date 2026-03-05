import { Categories, resolveContestAlias } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sanitizeCategoryPreviewAuthors } from '../util';


export const GET: RequestHandler = withApi(async ({ params, locals, url }) => {
    const name = await Categories.resolveName(params.name);
    const category = await Categories.findOne(
        { name },
    );

    if (!category) {
        return json(category);
    }

    return json(sanitizeCategoryPreviewAuthors({
        ...category,
        alias: resolveContestAlias(category),
    }));
});

export const POST: RequestHandler = withApi(async ({ params, locals, url }) => {
    const name = await Categories.resolveName(params.name);
    const category = await Categories.buildPreview(
        name
    );

    return json(category);
});
