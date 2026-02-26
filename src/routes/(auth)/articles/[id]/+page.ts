import type { Article } from '$lib/models';
import type { Underline } from '$lib/models/underline';
import { createApi } from '$lib/util/apiRequest';
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
    const api = createApi(fetch);

    const res = await api.get<ArticleData>(
        `/api/articles/${params.id}`,
    );

    return res;
};