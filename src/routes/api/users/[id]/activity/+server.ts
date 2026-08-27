import { UserDailyActivities } from "$lib/models";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = async ({ params, url }) => {
    const limit = Math.min(
        Math.max(Number(url.searchParams.get("limit") ?? 365) || 365, 1),
        365,
    );

    const days = await UserDailyActivities.getRecentDays(params.id, limit);

    return json(days);
};
