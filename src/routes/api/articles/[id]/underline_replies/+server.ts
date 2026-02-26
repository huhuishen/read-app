import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UnderlineReplies } from '$lib/models/underlineReply';


export const POST: RequestHandler = withApi(async ({ request, locals }) => {
    const req = await request.json();

    const res = await UnderlineReplies.add(req);

    return json(res);
});

