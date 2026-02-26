import { safe, SafeError } from '$lib/util/safe';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
    return await safe(async () => {
        const response = await fetch(`/api/articles/${params.id}`);
        if (!response.ok) {
            throw new SafeError(401, 'not authorized',);
        }

        const res = await response.json();

        // return {
        //     article: res.article as Article,
        // };
        return res;
    })
};