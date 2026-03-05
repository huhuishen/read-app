import { ArticleVoteStats, Articles, Users, type ArticleVoteState } from "$lib/models";
import { apiError, withApi } from "$lib/util/apiHandler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

type VoteUser = {
    id: string;
    name: string;
    avatarColor?: string;
    votedAt?: Date;
};

type VoteDoc = Pick<ArticleVoteState, "userId" | "updatedAt">;

export const GET: RequestHandler = withApi(async ({ params }) => {
    const article = await Articles.findOne(
        { id: params.id, isLatest: true, status: "上架" },
        { projection: { _id: 0, category: 1 } },
    );

    if (!article) {
        apiError(404, "Article not found");
    }

    // if (Date.now() < new Date(article.category.voteEnd).getTime()) {
    //     apiError(403, "Voting is not finished");
    // }

    const votes = await ArticleVoteStats.find(
        { articleId: params.id, voted: true },
        { projection: { _id: 0, userId: 1, updatedAt: 1 } },
    )
        .sort({ updatedAt: -1 })
        .toArray() as VoteDoc[];

    if (votes.length === 0) {
        return json([]);
    }

    const userIds = [...new Set(votes.map((vote) => vote.userId))] as string[];
    const users = await Users.find(
        { id: { $in: userIds } },
        { projection: { _id: 0, id: 1, name: 1, profile: 1 } },
    ).toArray();

    const userMap = new Map(
        users.map((user) => [
            user.id,
            {
                id: user.id,
                name: user.name,
                avatarColor: user.profile?.avatarColor ?? "",
            },
        ]),
    );

    const result: VoteUser[] = votes.map((vote) => {
        const user = userMap.get(vote.userId);
        if (!user) {
            return {
                id: vote.userId,
                name: "Unknown User",
                votedAt: vote.updatedAt,
            };
        }
        return {
            ...user,
            votedAt: vote.updatedAt,
        };
    });

    return json(result);
});
