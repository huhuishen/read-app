import { Categories, Tags } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = withApi(async ({ }) => {
    const [categories, tags] = await Promise.all([
        Categories.find(
            { show: true, level: 2 },
        ).sort({ year: -1, month: -1, createdAt: -1 }).limit(10).toArray(),
        Tags.find(
            { show: true },
        ).sort({ articleCount: -1, createdAt: -1 }).toArray(),
    ]);

    return json({ categories, tags });
});
