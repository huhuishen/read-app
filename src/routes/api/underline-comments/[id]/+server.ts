import { UnderlineComments } from '$lib/models/underlineComments';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
    const res = await UnderlineComments.remove(params.id);

    return json(res);
};
