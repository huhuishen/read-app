import { safe } from '$lib/util/safe';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ cookies, url }) => {
    return await safe(async () => {
        const token = cookies.get('token');
        const home = url.searchParams.get("redirect")

        if (token) {
            redirect(302, home ?? `/`);
        }

        return { home }
    });
};