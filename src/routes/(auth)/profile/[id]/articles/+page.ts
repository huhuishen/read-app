import type { Article, User } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });
    // console.log(userId);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const res = await api.get<DataPage<Article>>(
        `users/${params.id}/articles?page=${page}&limit=${limit}`,
    );

    return res;
};