import type { Article } from '$lib/models';
import type { ArticleReadState } from '$lib/models/articleStats';
import type { DataPage } from '$lib/mongolite';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    interface ResponseData {
        stats: DataPage<ArticleReadState>;
        articles: Article[];
    }
    const data = await api.get<ResponseData>(
        `users/${params.id}/read?page=${page}&limit=${limit}`,
    );

    return data;
};
