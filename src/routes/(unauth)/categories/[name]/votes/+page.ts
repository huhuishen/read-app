import type { Article } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApi } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApi(fetch);

    const data = await api.get<Article[]>(
        `/api/categories/${params.name}/votes`,
    );

    return {
        items: data
    };
};