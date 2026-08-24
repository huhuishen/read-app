import { Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const req = await request.json() as Record<string, unknown>;

    const email = req.email;
    const name = req.name;
    const password = req.password;

    if (!email || !password || !name) {
        return json({ message: 'Name, email and password are required' }, { status: 400 });
    }

    const [res] = await Users.add(String(email), String(name), String(password));

    if (!('acknowledged' in res) || !res.acknowledged) {
        return json({ message: 'Registration failed, please retry later' }, { status: 500 });
    }

    return json({ message: 'Registration successful, check email to activate' }, { status: 200 });
};
