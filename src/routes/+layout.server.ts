import type { LayoutServerLoad } from './$types';


export const load: LayoutServerLoad = ({ locals }) => {
    // hooks.server.ts 已通过 session 机制设置 locals.user
    return { user: locals.user };
};