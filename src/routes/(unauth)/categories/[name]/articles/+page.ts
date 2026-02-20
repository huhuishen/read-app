import type { Article } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApi } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApi(fetch);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const data = await api.get<DataPage<Article>>(
        `/api/categories/${params.name}/articles?page=${page}&limit=${limit}`,
    );

    return {
        category: params.name,
        ...data
    };
};