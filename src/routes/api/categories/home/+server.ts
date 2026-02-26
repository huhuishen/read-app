import { Categories } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = withApi(async ({ }) => {
    const res = await Categories.find(
        { show: true },
        { sort: { level: -1, order: -1 } }
    ).toArray();

    return json(res);
});