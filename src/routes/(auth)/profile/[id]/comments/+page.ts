import type { Comment } from '$lib/models/comments';
import type { DataPage } from '$lib/mongolite';
import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ fetch, params, url }) => {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const api = createApiClient(fetch, { baseUrl: "/api" });
    const comments = await api.get<DataPage<Comment>>(
        `users/${params.id}/comments?page=${page}&limit=${limit}`,
    );

    return { comments };
};