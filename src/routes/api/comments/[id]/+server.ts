import { Comments } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = withApi(async ({ params, locals }) => {
    const res = await Comments.remove(params.id, locals.user);

    return json(res);
});
