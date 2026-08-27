import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
    const user = locals.user;

    if (!user) {
        throw redirect(302, `/login`);
    }

    if (!user.roles?.includes("guest")) {
        throw redirect(302, `/`);
    }

    return { user };
};
