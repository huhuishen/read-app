import { createApi } from '$lib/util/apiRequest';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    const api = createApi(fetch);

    interface DayValue {
        date: string;
        readMinutes: number;
    }

    const days = await api.get<DayValue[]>(`/api/users/${params.id}/activity?page=1&limit=20`);

    return {days};
};