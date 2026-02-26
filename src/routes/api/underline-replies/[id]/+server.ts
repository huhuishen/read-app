import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UnderlineReplies } from '$lib/models/underlineReply';


export const DELETE: RequestHandler = withApi(async ({ params, locals }) => {
    const res = await UnderlineReplies.remove(params.id);

    return json(res);
});
