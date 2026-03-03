import { Users } from '$lib/models';
import { apiError, withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = withApi(async ({ request }) => {
    const req = await request.json() as Record<string, unknown>;

    const email = req.email;
    const name = req.name;
    const password = req.password;

    if (!email || !password || !name) {
        apiError(400, 'Name, email and password are required');
    }

    const [res] = await Users.add(String(email), String(name), String(password));

    if (!('acknowledged' in res) || !res.acknowledged) {
        apiError(500, 'Registration failed, please retry later');
    }

    return json({ message: 'Registration successful, check email to activate' }, { status: 200 });
});
