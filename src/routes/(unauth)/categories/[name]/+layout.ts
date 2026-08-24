import type { Category } from '$lib/models';
import { createApiClient } from '$lib/api/client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    const category = await api.get(
        `categories/${params.name}`,
    ) as Category;

    // return { userState };
    // redirect(307, `/categories/${encodeURI(params.name)}/articles`);
    return {
        params, category
    };
};