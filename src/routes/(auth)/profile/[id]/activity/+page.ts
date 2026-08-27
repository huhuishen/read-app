import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    interface DayValue {
        date: string;
        readMinutes: number;
    }

    const days = await api.get<DayValue[]>(`users/${params.id}/activity?limit=365`);

    return {days};
};