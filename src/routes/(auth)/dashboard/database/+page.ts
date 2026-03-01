import { createApi, safeCall } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApi(fetch);
    const data = await safeCall(api.get<{ success: boolean; backups: unknown[] }>('/api/backup/list'));

    return {
        backups: data?.success ? data.backups : [],
    };
};
