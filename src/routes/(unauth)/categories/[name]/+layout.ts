import type { Category } from '$lib/models';
import { createApi } from '$lib/util/apiRequest';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params }) => {
    const api = createApi(fetch);

    const category = await api.get(
        `/api/categories/${params.name}`,
    ) as Category;

    // return { userState };
    // redirect(307, `/categories/${encodeURI(params.name)}/articles`);
    return {
        params, category
    };
};