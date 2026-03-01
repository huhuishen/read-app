import { createApi, safeCall } from '$lib/util/apiRequest';
import { safe, SafeError } from '$lib/util/safe';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    return await safe(async () => {
        const api = createApi(fetch);
        const res = await safeCall(api.get(`/api/articles/${params.id}`));

        if (!res) {
            throw new SafeError(401, 'not authorized');
        }

        return res;
    });
};
