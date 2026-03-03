import { Users } from '$lib/models';
import { apiError, withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = withApi(async ({ request }) => {
    const { token } = await request.json() as { token?: string };

    if (!token) {
        apiError(400, 'Invalid token');
    }

    const user = await Users.findOne({ activateToken: token });

    if (!user) {
        apiError(400, 'Activation link is invalid');
    }

    if (user.activated) {
        return json({ message: 'Already activated' }, { status: 200 });
    }

    if (new Date(user.activateExpireAt) < new Date()) {
        apiError(400, 'Activation link has expired');
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
});
