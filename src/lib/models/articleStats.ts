import { type Entity } from "$lib/mongolite";
import type { ObjectId } from "mongodb";
import { Articles } from "./articles";
import { Collection } from "./db";
import { Users } from "./users";
import { Categories } from "./categories";

/**
    采用该结构以满足以下需求：
    行为轨迹分析
    用户行为统计
    增长分析
 */
export type ArticleUserState = {
    articleId: string,
    userId: string,
    action: "bookmark" | "vote" | "read",
    value: any,         // true/false for "bookmark" | "vote", 阅读时长 for "read"
    completion: number, // 完读率（仅供read使用）
    awardCategory?: string; // 新增：award 分类 name（仅供vote统计数量使用）
} & Entity


export class ArticleUserStateService extends Collection<ArticleUserState> {
    constructor() {
        super("article_user_stats");

        super.createIndex(
            { articleId: 1, userId: 1, action: 1 },
            { unique: true }
        )
    }

    async getState(
        articleId: string,
        userId: string
    ) {
        const list = await super.find({
            articleId,
            userId
        }).toArray();

        return {
            bookmarked: list.find(i => i.action === "bookmark")?.value ?? false,
            voted: list.find(i => i.action === "vote")?.value ?? 0,
            readSeconds: list.find(i => i.action === "read")?.value ?? 0,
            completion: list.find(i => i.action === "read")?.completion ?? 0
        };
    }

    async getArticleStats(articleId: string) {
        const result = await super.aggregate([
            {
                $match: { articleId }
            },
            {
                $group: {
                    _id: null,

                    bookmarkCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$action", "bookmark"] },
                                        { $eq: ["$value", true] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    voteCount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$action", "vote"] },
                                "$value"
                            ]
                        }
                    },

                    totalreadSeconds: {
                        $sum: {
                            $cond: [
                                { $eq: ["$action", "read"] },
                                "$value",
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return result[0] ?? {
            bookmarkCount: 0,
            voteCount: 0,
            totalreadSeconds: 0
        };
    }

    async setState(
        articleId: string,
        userId: string,
        action: "bookmark" | "vote" | "read",
        value: any,
        completion?: number,
    ) {
        if (action === "read") {
            const result = await super.updateOne(
                { articleId, userId, action: "read" },
                {
                    $inc: { value },
                    $set: { completion }
                },
                { upsert: true }
            );

            // 仅首次发送阅读时长时增加已阅量
            if (result.upsertedCount === 1) {
                await Articles.updateOne(
                    { id: articleId },
                    {
                        $inc: {
                            viewCount: 1,
                            readSeconds: value
                        }
                    }
                );
            } else {
                await Articles.updateOne(
                    { id: articleId },
                    {
                        $inc: {
                            readSeconds: value
                        }
                    }
                );
            }

            await Users.updateOne(
                { id: userId },
                {
                    $inc: {
                        readSeconds: value
                    }
                }
            );

            return
        }

        const result = await super.updateOne(
            { articleId, userId, action, value: { $ne: value } },
            {
                $set: { value }
            },
            { upsert: true }
        );

        // 没有发生变化
        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
            return result;
        }

        if (action === "bookmark") {
            const res = await Articles.updateOne(
                { id: articleId },
                {
                    $inc: {
                        bookmarkCount: value ? 1 : -1
                    }
                }
            );
            return res;
        }

        if (action === "vote") {
            const res = await Articles.updateOne(
                { id: articleId },
                {
                    $inc: {
                        voteCount: value ? 1 : -1
                    }
                }
            );
            return res;
        }
        // 不需要统计文章的累计阅读时长
    }

    async voteArticle(userId: string, articleId: string, voted: boolean) {
        const article = await Articles.findOne({ id: articleId }, { projection: { categories: 1 } });

        if (!article) throw new Error("Article not found");

        const awardCategory = await Categories.findOne({
            name: { $in: article.categories },
            award: true
        }, { projection: { name: 1 } });

        const awardCategoryName = awardCategory?.name;

        let count = 0;
        // 限制判断
        if (awardCategoryName) {
            count = await super.countDocuments({
                userId,
                action: "vote",
                awardCategory: awardCategoryName,
                value: true,
            });

            if (count >= 3) {
                throw new Error("该征文分类最多投3票");
            }
        }

        console.log(count);


        // 写入投票记录
        const result = await super.updateOne(
            { articleId, userId, action: "vote", awardCategory: awardCategoryName, value: { $ne: voted } },
            {
                $set: { value: voted }
            },
            { upsert: true }
        );

        // 没有发生变化
        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
            return result;
        }

        const res = await Articles.updateOne(
            { id: articleId },
            {
                $inc: {
                    voteCount: voted ? 1 : -1
                }
            }
        );

        return { remain: 3 - count - (voted ? 1 : -1) };
    }

    // async getUserDailyActivity(userId: string, from: Date, to: Date) {
    async getUserDailyActivity(userId: string) {
        return super.aggregate([
            {
                $match: {
                    userId,
                    action: "read",
                    // createdAt: {
                    //     $gte: from,
                    //     $lte: to
                    // }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    readSeconds: { $sum: "$value" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    readMinutes: {
                        $round: [
                            { $divide: ["$readSeconds", 60] },
                            0
                        ]
                    }
                }
            },
            {
                $sort: { date: 1 }
            }
        ])
    }
}

export const ArticleUserStats = new ArticleUserStateService();