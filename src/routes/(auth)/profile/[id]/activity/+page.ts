import { createApiClient } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    interface DayValue {
        date: string;
        readMinutes: number;
    }

    const days = await api.get<DayValue[]>(`users/${params.id}/activity?page=1&limit=20`);

    return {days};
};