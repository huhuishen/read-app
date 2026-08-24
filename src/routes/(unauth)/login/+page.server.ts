import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ locals, url }) => {
    // hooks.server.ts 已通过 session 机制设置 locals.user
    const home = url.searchParams.get("redirect")

    if (locals.user) {
        throw redirect(302, home ?? `/`);
    }

    return { home }
};