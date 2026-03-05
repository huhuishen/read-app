import type { Article } from '$lib/models';
import { createApi, safeCall } from '$lib/util/apiRequest';
import { safe, SafeError } from '$lib/util/safe';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    return await safe(async () => {
        const api = createApi(fetch);
        const res = await safeCall<{ article: Article }>(
            api.get(`/api/articles/${params.id}`),
        );

        if (!res?.article) {
            throw new SafeError(401, 'not authorized');
        }

        return {
            article: res.article,
        };
    });
};
