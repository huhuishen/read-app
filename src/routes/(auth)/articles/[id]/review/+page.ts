import type { Article } from '$lib/models';
import { createApiClient } from '$lib/api/client';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });
    const res = await api.get<{ article: Article }>(`articles/${params.id}`);

    if (!res?.article) {
        throw error(401, 'not authorized');
    }

    return {
        article: res.article,
    };
};
