import { UnderlineComments } from '$lib/models/underlineComments';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = withApi(async ({ params, locals }) => {
    const res = await UnderlineComments.remove(params.id);

    return json(res);
});
