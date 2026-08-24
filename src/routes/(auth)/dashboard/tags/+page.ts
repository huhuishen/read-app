import type { Tag } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const name = url.searchParams.get('q') || '';

    const res = await api.get<DataPage<Tag>>(
        `tags?q=${name}&page=${page}&limit=${limit}`,
    );

    return res;
};