import type { Article } from "$lib/models";
import type { DataPage } from "$lib/mongolite";
import { createApi } from "$lib/util/apiRequest";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApi(fetch);
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    const res = await api.get<DataPage<Article>>(
        `/api/tags/${encodeURIComponent(params.name)}/articles?page=${page}&limit=${limit}`,
    );

    return {
        params,
        ...res,
    };
};
