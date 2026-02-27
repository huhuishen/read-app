import { type Entity } from "$lib/mongolite";
import type { Filter } from "mongodb";
import { Articles, type Article } from "./articles";
import { Comments } from "./comments";
import { Collection } from "./db";


// export const CategorySchema = t.object({
//     name: t.string(),
//     show: t.boolean(),
//     articleCount: t.number(),
//     previewSize: t.number(),
//     previewArticles: t.array(t.object({
//         id: t.string(),
//         title: t.string(),
//         author: t.string(),
//         coverImage: t.string(),
//     })),
// });

// export type Category = Infer<typeof CategorySchema> & Entity
export type Category = {
    name: string;
    contest: boolean;


    description?: string;
    show: boolean; // 是否首页显示
    award?: boolean; // 有奖征文
    submissionStart?: Date;
    submissionEnd?: Date;
    voteEnd?: Date;
    level: 0 | 1 | 2;
    order?: number; // 首页排序
    articleCount: number;
    previewSize?: number;
    previewArticles?: {
        id: string;
        title: string;
        author: string;
        coverImage?: string;
    }[];
} & Entity


export class CategoryService extends Collection<Category> {
    constructor() {
        super("categories");
        super.createIndex({ name: 1 }, { unique: true });
    }

    async createAward(year: number, month: number) {
        const { submissionStart, submissionEnd, voteEnd } = getContestTimeline(year, month);

        const doc: Category = {
            name: `${month}届零重力杯`,
            contest: true,
            show: true,
            level: 2,
            articleCount: 0,
            previewSize: 8,
            previewArticles: [],
            award: true,
            submissionStart,
            submissionEnd,
            voteEnd,
        }
        return await super.insertOne(doc);
    }

    async ensureExists(name: string) {
        return await super.updateOne(
            { name },
            {
                $setOnInsert: {
                    name,
                    show: true,
                }
            },
            {
                upsert: true
            }
        );
    }

    async addPreview(article: Article) {
        if (!article.contest?.period) return;

        const doc = {
            id: article.id,
            title: article.title,
            author: article.author,
            coverImage: article.coverImage,
        }

        // await this.ensureExists(article.contest.period);
        return await super.updateOne(
            { name: article.contest?.period },
            {
                $setOnInsert: {
                    name: article.contest?.period,
                    contest: true,
                },

                // 每次执行都增加文章数
                $inc: {
                    articleCount: 1
                },

                // 每次执行都加入 preview
                $push: {
                    previewArticles: {
                        $each: [doc],
                        $position: 0, // 最新放前面
                        // $slice: -10  // 可选限制 preview 数量
                    }
                },
            },
            {
                upsert: true
            }
        );
    }

    async buildPreview(name: string, size: number = 5, show: boolean = true) {
        const articleCount = await Articles.countDocuments({ categories: name });
        const res = await Articles.find({ categories: name, status: "published" },
            { projection: { id: 1, title: 1, author: 1, coverImage: 1, _id: 0 } }).limit(size).toArray();

        return await super.updateOne(
            {
                name,
            },
            {
                $set: {
                    name,
                    show,
                    articleCount,
                    previewSize: size,
                    previewArticles: res,
                }
            },
            { upsert: true })
    }


    /**
     * 获取文章所属征文信息
     * @returns 文章所属征文 Category 或 undefined
     */
    async getContestByArticle(categories: string[]) {
        if (!categories) return undefined;

        // 2. 找到文章所属的征文 Category（award=true 且包含投稿/投票时间）
        const contest = await Categories.findOne({
            name: { $in: categories },
            award: true,
        });

        if (!contest) return undefined;

        // 3. 返回简化的征文信息
        return {
            name: contest.name,
            submissionStart: contest.submissionStart,
            submissionEnd: contest.submissionEnd,
            voteEnd: contest.voteEnd,
        };
    }
    // async get() {
    //     // return await super.find({}).sort({ createdAt: -1 }).toArray();
    //     const res = await super.aggregate([
    //         {
    //             $facet: {
    //                 hasPreview: [
    //                     { $match: { previewSize: { $gt: 0 } } },
    //                     { $sort: { createdAt: -1 } },
    //                     { $limit: 5 }
    //                 ],
    //                 noPreview: [
    //                     { $match: { previewSize: 0 } },
    //                     { $sort: { name: 1 } },
    //                     { $limit: 20 }
    //                 ]
    //             }
    //         }
    //     ]);
    //     return res[0];
    // }

    // async at(name: string) {
    //     // 1. 查询拥有该标签的所有文章ID
    //     const articles = await Articles.find(
    //         { categories: name, isLatest: true, status: "published" },
    //         { projection: { id: 1, title: 1, author: 1, coverImage: 1, createdAt: 1 } }
    //     ).toArray();

    //     const articleIds = articles.map(doc => doc.id);

    //     // 2. 查询这些文章的所有评论
    //     const comments = await Comments.find(
    //         { articleId: { $in: articleIds } }
    //     ).toArray();

    //     return { articles, comments }
    // }
}

export const Categories = new CategoryService();



// utils/contest.ts

/**
 * 获取当前征文周期时间点
 * - submissionStart: 本月1日
 * - submissionEnd: 本月最后一天
 * - voteEnd: 下月10日10:00
 */
export function getContestTimeline(year: number, month: number) {
    // month 0-11

    // 本月1日 00:00:00
    const submissionStart = new Date(year, month - 1, 1, 0, 0, 0);

    // 本月最后一天 23:59:59
    const submissionEnd = new Date(year, month, 0, 23, 59, 59);

    // 下月10日 10:00:00
    const voteEnd = new Date(year, month, 10, 10, 0, 0);

    return { submissionStart, submissionEnd, voteEnd };
}

/**
 * 获取当前征文周期标识（格式 yyyy-MM）
 */
export function getCurrentContestPeriod(now = new Date()) {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, "0")}`;
}