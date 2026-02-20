import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params }) => {
    // const api = createApi(fetch);

    // const userState = await api.get(
    //     `/api/users/${params.id}`,
    // ) as User;

    // return { userState };
    // redirect(307, `/categories/${encodeURI(params.name)}/articles`);
    return {
        params
    };
};