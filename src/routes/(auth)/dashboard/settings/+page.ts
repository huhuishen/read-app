import { createApi, safeCall } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApi(fetch);
    const res = await safeCall<{ autoPublishWithoutReview: boolean }>(
        api.get('/api/settings/publish'),
    );

    return {
        autoPublishWithoutReview: !!res?.autoPublishWithoutReview,
    };
};
