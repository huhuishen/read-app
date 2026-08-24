import type { User } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ fetch, url }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '25');

    const res = await api.get<DataPage<User>>(
        `users?page=${page}&limit=${limit}`,
    );

    return res;
};