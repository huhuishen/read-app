import type { User } from '$lib/models';
import { createApiClient } from '$lib/api/client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    const userState = await api.get(
        `users/${params.id}`,
    ) as User;

    return { userState };
};