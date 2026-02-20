import { getUser } from '$lib/util/apiHandler';
import { safe } from '$lib/util/safe';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies, locals, url }) => {
    return safe(() => {
        const user = getUser(cookies);

        if (!user) {
            const home = url.pathname + url.search
            redirect(302, `/login/?redirect=${home}`);
        }

        // if (user.roles?.includes("administrator")) {
        //     redirect(302, `/dashboard`);
        // }

        locals.user = user;
        return { user }
    });
}