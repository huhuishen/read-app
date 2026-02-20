
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logs, type Log } from '$lib/models';
import { cookieOptions } from '$lib/config';

export const POST: RequestHandler = async ({ locals, cookies }) => {

    try {
        cookies.delete('token', cookieOptions);
        // redirect(303, '/');

        // if (locals.user) {
        //     const event = {
        //         uid: locals.user.id, event: "logout"
        //     };

        //     Logs.insertOne(event as Log);
        // }

        return json({}, { status: 200 });
    } catch (error) {
        return json({ error: JSON.stringify(error) }, { status: 500 });
    }
};