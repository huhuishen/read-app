import { Comments, Categories, type Comment } from "$lib/models";
import type { DataPage } from "$lib/mongolite";
import { withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

type GroupedComments = {
    userId: string;
    user: string;
    count: number;
    comments: Partial<Comment>[];
};

export const GET: RequestHandler = withApi(async ({ params, url }) => {
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const skip = (page - 1) * limit;
    const name = await Categories.resolveName(params.name);

    const result = await Comments.aggregate<{
        items: GroupedComments[];
        total: Array<{ count: number }>;
    }>([
        {
            $lookup: {
                from: "articles",
                localField: "articleId",
                foreignField: "id",
                as: "article",
            },
        },
        { $unwind: "$article" },
        {
            $match: {
                "article.category.period": name,
                "article.isLatest": true,
                "article.status": "上架",
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$userId",
                user: { $first: "$user" },
                count: { $sum: 1 },
                comments: {
                    $push: {
                        _id: "$_id",
                        articleId: "$articleId",
                        userId: "$userId",
                        user: "$user",
                        content: "$content",
                        rating: "$rating",
                        likes: "$likes",
                        liked: "$liked",
                        replyTo: "$replyTo",
                        quote: "$quote",
                        createdAt: "$createdAt",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                user: 1,
                count: 1,
                comments: 1,
            },
        },
        { $sort: { count: -1, "comments.0.createdAt": -1, user: 1 } },
        {
            $facet: {
                items: [{ $skip: skip }, { $limit: limit }],
                total: [{ $count: "count" }],
            },
        },
    ]);

    const data = result[0] ?? { items: [], total: [] };
    const totalItems = data.total[0]?.count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    const response: DataPage<GroupedComments> = {
        items: data.items,
        page,
        limit,
        totalItems,
        totalPages,
    };

    return json(response);
});
