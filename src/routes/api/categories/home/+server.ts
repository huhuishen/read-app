import { Categories, resolveContestAlias, Tags } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sanitizeCategoryPreviewAuthors } from '../util';



export const GET: RequestHandler = async ({ }) => {
    const [categories, tags] = await Promise.all([
        Categories.find(
            { show: true },
        ).sort({ year: -1, month: -1 }).limit(10).toArray(),
        Tags.find(
            { show: true },
        ).sort({ articleCount: -1, createdAt: -1 }).toArray(),
    ]);

    const sanitizedCategories = categories.map((category) => sanitizeCategoryPreviewAuthors({
        ...category,
        // alias: resolveContestAlias(category),
    }));

    return json({ categories: sanitizedCategories, tags });
};
