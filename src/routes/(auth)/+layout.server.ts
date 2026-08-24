import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
    // hooks.server.ts 已通过 session 机制设置 locals.user
    const user = locals.user;

    if (!user) {
        const home = url.pathname + url.search
        throw redirect(302, `/login/?redirect=${home}`);
    }

    // if (user.roles?.includes("administrator")) {
    //     redirect(302, `/dashboard`);
    // }

    return { user }
}