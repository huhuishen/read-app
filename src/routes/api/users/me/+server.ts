import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return json({ message: "Unauthorized" }, { status: 401 });
    return json(event.locals.user, { status: 200 });
};
