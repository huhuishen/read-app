import type { Category } from "$lib/models";
import type { DataPage } from "$lib/mongolite";
import { createApi } from "$lib/util/apiRequest";
import type { PageLoad } from "./$types";


export const load: PageLoad = async ({ fetch, url }) => {
    const api = createApi(fetch);

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const name = url.searchParams.get('q');

    const res = await api.get<DataPage<Category>>(
        `/api/categories?page=${page}&limit=${limit}`,
    );

    return res;
};