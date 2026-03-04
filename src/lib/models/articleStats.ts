import { type Entity } from "$lib/mongolite";
import { Articles } from "./articles";
import { Collection } from "./db";
import { Users } from "./users";

export type ArticleStatsAction = "bookmark" | "vote" | "read";

export type ArticleBookmarkState = {
    articleId: string;
    userId: string;
    bookmarked: boolean;
} & Entity;

export type ArticleVoteState = {
    articleId: string;
    userId: string;
    voted: boolean;
    period?: string;
} & Entity;

export type ArticleReadState = {
    articleId: string;
    userId: string;
    readSeconds: number;
    completion: number;
} & Entity;

export type ArticleStatsSetRequest =
    | { action: "bookmark"; value: boolean }
    | { action: "vote"; value: boolean }
    | { action: "read"; value: number; completion?: number };

class ArticleBookmarkStateService extends Collection<ArticleBookmarkState> {
    constructor() {
        super("article_user_bookmarks");
        super.createIndex({ articleId: 1, userId: 1 }, { unique: true });
    }

    async setState(articleId: string, userId: string, bookmarked: boolean) {
        const result = await super.updateOne(
            { articleId, userId, bookmarked: { $ne: bookmarked } },
            { $set: { bookmarked } },
            { upsert: true },
        );

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
            return result;
        }

        return Articles.updateOne(
            { id: articleId },
            {
                $inc: {
                    "stats.mark": bookmarked ? 1 : -1,
                },
            },
        );
    }
}

class ArticleVoteStateService extends Collection<ArticleVoteState> {
    constructor() {
        super("article_user_votes");
        super.createIndex({ articleId: 1, userId: 1 }, { unique: true });
        super.createIndex({ userId: 1, period: 1, voted: 1 });
    }

    async setState(
        articleId: string,
        userId: string,
        voted: boolean,
        period?: string,
    ) {
        const result = await super.updateOne(
            { articleId, userId, voted: { $ne: voted } },
            {
                $set: {
                    voted,
                    ...(period ? { period: period } : {}),
                },
            },
            { upsert: true },
        );

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
            return result;
        }

        return Articles.updateOne(
            { id: articleId },
            {
                $inc: {
                    "stats.vote": voted ? 1 : -1,
                },
            },
        );
    }

    async voteArticle(userId: string, articleId: string, voted: boolean) {
        const article = await Articles.findOne(
            { id: articleId },
            { projection: { category: 1 } },
        );

        if (!article) {
            throw new Error("Article not found");
        }

        const period = article.category.period;
        const current = await super.findOne({ articleId, userId });

        if (voted && !current?.voted) {
            const count = await super.countDocuments({
                userId,
                period: period,
                voted: true,
            });
            if (count >= 3) {
                throw new Error("Vote limit reached for this period");
            }
        }

        await this.setState(articleId, userId, voted, period);

        const remain =
            3 -
            (await super.countDocuments({
                userId,
                period: period,
                voted: true,
            }));

        return { remain };
    }
}

class ArticleReadStateService extends Collection<ArticleReadState> {
    constructor() {
        super("article_user_reads");
        super.createIndex({ articleId: 1, userId: 1 }, { unique: true });
        super.createIndex({ userId: 1, updatedAt: -1 });
    }

    async setState(
        articleId: string,
        userId: string,
        readSeconds: number,
        completion = 0,
    ) {
        if (!Number.isFinite(readSeconds) || readSeconds <= 0) {
            return;
        }

        const result = await super.updateOne(
            { articleId, userId },
            {
                $inc: { readSeconds },
                $set: { completion },
            },
            { upsert: true },
        );

        if (result.upsertedCount === 1) {
            await Articles.updateOne(
                { id: articleId },
                {
                    $inc: {
                        "stats.view": 1,
                        readSeconds,
                    },
                },
            );
        } else {
            await Articles.updateOne(
                { id: articleId },
                {
                    $inc: {
                        readSeconds,
                    },
                },
            );
        }

        await Users.updateOne(
            { id: userId },
            {
                $inc: {
                    readSeconds,
                },
            },
        );
    }

    async getUserDailyActivity(userId: string) {
        return super.aggregate([
            {
                $match: {
                    userId,
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                        },
                    },
                    readSeconds: { $sum: "$readSeconds" },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    readMinutes: {
                        $round: [{ $divide: ["$readSeconds", 60] }, 0],
                    },
                },
            },
            {
                $sort: { date: -1 },
            },
        ]);
    }
}

class ArticleUserStatsService {
    async getState(articleId: string, userId: string) {
        const [bookmark, vote, read] = await Promise.all([
            ArticleBookmarkStats.findOne({ articleId, userId }),
            ArticleVoteStats.findOne({ articleId, userId }),
            ArticleReadStats.findOne({ articleId, userId }),
        ]);

        return {
            bookmarked: bookmark?.bookmarked ?? false,
            voted: vote?.voted ?? false,
            readSeconds: read?.readSeconds ?? 0,
            completion: read?.completion ?? 0,
        };
    }

    async getArticleStats(articleId: string) {
        const [mark, vote, readAgg] = await Promise.all([
            ArticleBookmarkStats.countDocuments({ articleId, bookmarked: true }),
            ArticleVoteStats.countDocuments({ articleId, voted: true }),
            ArticleReadStats.aggregate([
                { $match: { articleId } },
                {
                    $group: {
                        _id: null,
                        totalreadSeconds: { $sum: "$readSeconds" },
                    },
                },
            ]),
        ]);

        return {
            mark,
            vote,
            totalreadSeconds: readAgg[0]?.totalreadSeconds ?? 0,
        };
    }

    async setState(articleId: string, userId: string, req: ArticleStatsSetRequest) {
        if (req.action === "bookmark") {
            return ArticleBookmarkStats.setState(articleId, userId, req.value);
        }
        if (req.action === "vote") {
            return ArticleVoteStats.setState(articleId, userId, req.value);
        }
        return ArticleReadStats.setState(
            articleId,
            userId,
            req.value,
            req.completion ?? 0,
        );
    }

    async voteArticle(userId: string, articleId: string, voted: boolean) {
        return ArticleVoteStats.voteArticle(userId, articleId, voted);
    }

    async getUserDailyActivity(userId: string) {
        return ArticleReadStats.getUserDailyActivity(userId);
    }
}

export const ArticleBookmarkStats = new ArticleBookmarkStateService();
export const ArticleVoteStats = new ArticleVoteStateService();
export const ArticleReadStats = new ArticleReadStateService();
export const ArticleUserStats = new ArticleUserStatsService();
