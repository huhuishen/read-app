import type { Article } from "$lib/models";
import type { DataPage } from "$lib/mongolite";
import { createApiClient } from "$lib/api/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params, url }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    const res = await api.get<DataPage<Article>>(
        `tags/${encodeURIComponent(params.name)}/articles?page=${page}&limit=${limit}`,
    );

    return {
        params,
        ...res,
    };
};
