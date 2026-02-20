import type { Article } from '$lib/models';
import type { ArticleUserState } from '$lib/models/articleStats';
import type { DataPage } from '$lib/mongolite';
import { createApi } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApi(fetch);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    interface ResponseData {
        stats: DataPage<ArticleUserState>;
        articles: Article[];
    }
    const data = await api.get<ResponseData>(
        `/api/users/${params.id}/read?page=${page}&limit=${limit}`,
    );

    return data;
};