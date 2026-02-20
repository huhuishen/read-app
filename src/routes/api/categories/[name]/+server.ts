import { Categories } from '$lib/models';
import { safe, SafeError } from '$lib/util/safe';

export async function GET({ params }) {
    return await safe(async () => {
        const res = await Categories.at(params.name);
        if (!res) {
            throw new SafeError(404, 'Categories not found');
        }

        return new Response(JSON.stringify(res));
    });
}

