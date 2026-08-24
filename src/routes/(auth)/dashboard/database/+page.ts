import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });
    let backups: unknown[] = [];
    try {
        const data = await api.get<{ success: boolean; backups: unknown[] }>('backup/list');
        backups = data?.success ? data.backups : [];
    } catch {}

    return {
        backups,
    };
};
