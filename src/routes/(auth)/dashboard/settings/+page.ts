import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });
    let autoPublishWithoutReview = false;
    try {
        const res = await api.get<{ autoPublishWithoutReview: boolean }>(
            'settings',
        );
        autoPublishWithoutReview = !!res?.autoPublishWithoutReview;
    } catch {}

    return {
        autoPublishWithoutReview,
    };
};
