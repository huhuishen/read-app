import { ArticleReadStats } from "$lib/models/articleStats";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = async ({ params, locals, url }) => {

    const days = await ArticleReadStats.getUserDailyActivity(params.id);


    return json(days);
};
