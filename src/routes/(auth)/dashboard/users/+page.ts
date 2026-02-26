import type { User } from '$lib/models';
import type { DataPage } from '$lib/mongolite';
import { createApi } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ fetch, url }) => {
    const api = createApi(fetch);

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '25');

    const res = await api.get<DataPage<User>>(
        `/api/users?page=${page}&limit=${limit}`,
    );

    return res;
};