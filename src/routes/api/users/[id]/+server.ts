import { Users } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = withApi(async ({ params }) => {
    const user = await Users.findOne(
        {
            id: params.id,
        },
        { projection: { _id: 0, password: 0 } }
    );

    return json(user);
});

export const POST: RequestHandler = withApi(async () => {
    // historical migration endpoint placeholder
    return json({});
});
