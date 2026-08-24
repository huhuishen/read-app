import type { Article } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    const data = await api.get<Article[] | null>(
        `categories/${params.name}/votes`,
    );

    return {
        items: data
    };
};