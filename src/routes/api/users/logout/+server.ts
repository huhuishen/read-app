import { cookieOptions } from '$lib/config';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = withApi(async ({ cookies }) => {
    cookies.delete('token', cookieOptions);
    return json({}, { status: 200 });
});
