import { Categories } from '$lib/models';
import { safe, SafeError } from '$lib/util/safe';

export async function GET({ }) {
    return await safe(async () => {
        const res = await Categories.get();
        if (!res) {
            throw new SafeError(404, 'User not found');
        }

        return new Response(JSON.stringify(res));
    });
}

export async function POST({ request }) {
    return await safe(async () => {
        const req = await request.json();

        if (!req.name) {
            throw new SafeError(404, 'name not specfied');
        }

        const res = await Categories.build(req.name, req.size);

        return new Response(JSON.stringify(res));
    });
}
