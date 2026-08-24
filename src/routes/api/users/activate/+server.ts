import { Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const { token } = await request.json() as { token?: string };

    if (!token) {
        return json({ message: 'Invalid token' }, { status: 400 });
    }

    const user = await Users.findOne({ activateToken: token });

    if (!user) {
        return json({ message: 'Activation link is invalid' }, { status: 400 });
    }

    if (user.activated) {
        return json({ message: 'Already activated' }, { status: 200 });
    }

    if (new Date(user.activateExpireAt) < new Date()) {
        return json({ message: 'Activation link has expired' }, { status: 400 });
    }

    await Users.updateOne(
        { id: user.id },
        {
            $set: {
                activated: true
            },
            $unset: {
                activateToken: '',
                activateExpireAt: ''
            }
        }
    );

    return json({ message: 'Activation successful' }, { status: 200 });
};
