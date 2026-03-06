import type { Comment } from "$lib/models";
import type { DataPage } from "$lib/mongolite";
import { createApi } from "$lib/util/apiRequest";
import type { PageLoad } from "./$types";

type GroupedComments = {
    mode: "user" | "article";
    count: number;
    userId?: string;
    user?: string;
    articleId?: string;
    articleTitle?: string;
    comments: Partial<Comment>[];
};

export const load: PageLoad = async ({ fetch, params, url }) => {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const mode = url.searchParams.get("mode") === "article"
        ? "article"
        : "user";
    const api = createApi(fetch);

    const groups = await api.get<DataPage<GroupedComments>>(
        `/api/categories/${params.name}/comments?page=${page}&limit=${limit}&mode=${mode}`,
    );

    return {
        groups,
        mode,
    };
};
