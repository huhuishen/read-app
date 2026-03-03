import { requireUser, withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    return json(user, { status: 200 });
});
