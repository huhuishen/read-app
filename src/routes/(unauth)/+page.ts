import type { Article, Category, Tag } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const q = url.searchParams.get('q') || '';

    if (q.trim() === "") {
        const res = await api.get<{ categories: Category[]; tags: Tag[] }>(`categories/home`);
        return res;
    } else {
        const res = await api.get<DataPage<Article>>(
            `articles?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
        );

        return { query: q, searchResults: res };
    }
};
