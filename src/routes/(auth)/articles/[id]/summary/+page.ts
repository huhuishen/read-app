import type { Article } from '$lib/models';
import type { Underline } from '$lib/models/underline';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

interface ArticleData {
    article: Article;
    underlines: Underline[];
}

export const load: PageLoad = async ({ fetch, params }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    const res = await api.get<ArticleData>(
        `articles/${params.id}`,
    );

    return res;
};