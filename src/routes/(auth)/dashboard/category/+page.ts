import { safe } from "$lib/util/safe";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    return await safe(async () => {
        const response = await fetch('/api/categories');
        const data = await response.json();

        return { categories: data };
    });
};