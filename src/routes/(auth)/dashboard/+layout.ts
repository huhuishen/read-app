import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ parent }) => {
    const { user } = await parent();
    if (!user.roles?.includes("administrator")) {
        redirect(302, `/`);
    }
    // return {
    //     user,
    // };
};