import type { User } from '$lib/models';
import { createApi } from '$lib/util/apiRequest';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params }) => {
    const api = createApi(fetch);

    const userState = await api.get(
        `/api/users/${params.id}`,
    ) as User;

    return { userState };
};