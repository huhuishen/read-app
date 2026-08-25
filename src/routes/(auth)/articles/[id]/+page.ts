import type { Article } from '$lib/models';
import type { Underline } from '$lib/models/underline';
import { createApiClient, loadApi } from '$lib/api/client';
import type { PageLoad } from './$types';

interface ArticleData {
    article: Article;
    underlines: Underline[];
    userStats: {
        bookmarked: boolean,
        voted: boolean,
        readSeconds: number,
        completion: number
    };
    contest: {
        name: string;
        submissionStart: Date;
        submissionEnd: Date;
        voteEnd: Date;
    }
}

export const load: PageLoad = async ({ fetch, params }) => {
    const api = createApiClient(fetch, { baseUrl: "/api" });

    return loadApi(api.get<ArticleData>(`articles/${params.id}`));
};