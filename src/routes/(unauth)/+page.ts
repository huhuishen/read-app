import type { Article, Category } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApi } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApi(fetch);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const q = url.searchParams.get('q') || '';

    if (q.trim() === "") {
        const categories = await api.get<Category[]>(`/api/categories/home`);
        return { categories };
    } else {
        const res = await api.get<DataPage<Article>>(
            `/api/articles?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
        );

        return { query: q, searchResults: res };
    }
};
