import { type Entity } from "$lib/mongolite";
import { SafeError } from "$lib/util/safe";
import { ArticleUserStats } from "./articleStats";
import { Categories } from "./categories";
import { Comments } from "./comments";
import { Collection } from "./db";
import { Underlines } from "./underline";
import type { User } from "./users";


// export const ArticleSchema = t.object({
//     id: t.string(),
//     version: t.number(),
//     isLatest: t.boolean(),
//     title: t.string(),
//     authorId: t.string(),
//     author: t.string(),
//     content: t.string(),
//     coverImage: t.string(),
//     summary: t.string(),
//     categories: t.array(t.string()),
//     status: t.union(
//         t.literal("draft"),
//         t.literal("pending"),
//         t.literal("published"),
//         t.literal("scheduled"),),

//     viewCount: t.number(),
//     bookmarkCount: t.number(),
//     commentCount: t.number(),

//     rating: t.number(),
//     ratingSum: t.number(),
//     ratingCount: t.number(),
//     avgRating: t.number(),
// });

// export type Article = Infer<typeof ArticleSchema> & Entity & { voted: boolean }

/**
 * 章节号及索引导航

 */

export type Article = {
    id: string;
    version: number;
    isLatest: boolean;
    title: string;
    authorId?: string;
    author?: string;
    content: string;
    coverImage: string;
    summary: string;
    tags: string[],
    status: "草稿" | "待审核" | "上架" | "下架"

    stats: {
        view: number;
        mark: number;
        comment: number;
        vote: number;
        rate: number;
        rateSum: number;
        rateCount: number;
        readSeconds: number;
    };

    category: {
        year: number;
        month: number;
        /**
         * 征文期标识
         * 格式：yyyy-MM
         * 示例：2026-02
         */
        period: string;

        /**
         * 投票截止（下月10日）
         */
        voteEnd: Date;
    };
} & Entity;

const defaultArticleStats = {
    view: 0,
    mark: 0,
    comment: 0,
    vote: 0,
    rate: 0,
    rateSum: 0,
    rateCount: 0,
};

// export function ensureArticleStats<T extends Partial<Article> & Record<string, any>>(article: T) {
//     article.stats = {
//         view: article.stats?.view ?? article.viewCount ?? 0,
//         mark: article.stats?.mark ?? article.bookmarkCount ?? 0,
//         comment: article.stats?.comment ?? article.commentCount ?? 0,
//         vote: article.stats?.vote ?? article.voteCount ?? 0,
//         rate: article.stats?.rate ?? article.stats?.rateAvg ?? article.rating ?? article.avgRating ?? 0,
//         rateSum: article.stats?.rateSum ?? article.ratingSum ?? 0,
//         rateCount: article.stats?.rateCount ?? article.ratingCount ?? 0,
//     };

//     return article as T & { stats: typeof defaultArticleStats };
// }

export class ArticleService extends Collection<Article> {
    constructor() {
        super("articles");
        super.createIndex({ id: 1, isLatest: 1 },
            { unique: true, partialFilterExpression: { isLatest: true } });
        super.createIndex({ isLatest: 1, status: 1, updatedAt: -1 });
    }

    // async list(skip: number, limit: number, isAdmin: boolean = false) {
    //     let filter = {};

    //     if (isAdmin) {
    //         filter = { isLatest: true, status: { $in: ["pending", "published"] } }
    //     }
    //     else {
    //         filter = { isLatest: true, status: "published" }
    //     }

    //     const articles = await this.find(filter, { projection: { content: 0, isLatest: 0 } })
    //         .sort({ status: 1, createdAt: -1 })
    //         .skip(skip)
    //         .limit(limit).toArray();

    //     const total = await super.countDocuments(filter);

    //     return { articles, total }
    // }

    async listByCategory(name: string, page: number, limit = 25, userId: string = "") {
        const data = await Articles.findPage(
            { categories: name, isLatest: true, status: "上架" },
            { projection: { _id: 0, content: 0 } },
            { page, limit }
        );

        if (data.totalItems <= 0) throw new SafeError(404, "找不到指定的分类目录");

        return {
            ...data
        }
    }

    async getByArticleId(articleId: string, user: Partial<User>) {
        const filter = this.buildAccessFilter(articleId, user);
        const article = await this.findOne(filter as any);

        if (!article) {
            throw new SafeError(404, "找不到文章");
        }

        // ensureArticleStats(article);

        article.stats.rate = article.stats.rateCount > 0
            ? (article.stats.rateSum / article.stats.rateCount) * 2
            : 0;

        // 划线评论是跟随
        const underlines = await Underlines.findByArticle(article.id, article.version);
        const userStats = await ArticleUserStats.getState(article.id, user.id!);
        // const contest = await Categories.getContestByArticle(article.categories);

        // return { article: { ...article, ...stats }, underlines, contest };
        return { article, userStats, underlines };
    }



    private buildAccessFilter(articleId: string, user: Partial<User>) {
        const isPrivileged =
            user.roles?.includes('administrator') ||
            user.roles?.includes('editor');

        if (isPrivileged) {
            return {
                id: articleId,
                isLatest: true,
                status: { $in: ["上架", "待审核", "下架"] }
            };
        }

        return {
            id: articleId,
            isLatest: true,
            $or: [
                { status: '上架' },
                { authorId: user.id }
            ]
        };
    }

    // async syncArticleCategories(
    //     articleId: string,
    //     oldCategories: string[],
    //     newCategories: string[]
    // ) {
    //     const added = newCategories.filter(c => !oldCategories.includes(c));
    //     const removed = oldCategories.filter(c => !newCategories.includes(c));

    //     if (added.length > 0) {
    //         await Categories.updateMany(
    //             { name: { $in: added } },
    //             { $inc: { articleCount: 1 } }
    //         );
    //     }

    //     if (removed.length > 0) {
    //         await Categories.updateMany(
    //             { slug: { $in: removed } },
    //             { $inc: { articleCount: -1 } }
    //         );
    //     }

    //     await this.updatePreviewArticles([...added, ...removed]);
    // }

    // async updatePreviewArticles(names: string[]) {
    //     for (const name of names) {
    //         const category = await Categories.findOne({ name });

    //         if (!category) continue;

    //         const articles = await Articles.find(
    //             { categories: name },
    //             {
    //                 projection: {
    //                     title: 1,
    //                     author: 1,
    //                     coverImage: 1
    //                 }
    //             }
    //         )
    //             .sort({ createdAt: -1 })
    //             .limit(category.previewSize ?? 8)
    //             .toArray();

    //         if (category.size == "lg") {
    //             await Categories.updateOne(
    //                 { name },
    //                 {
    //                     $set: {
    //                         previewArticles: articles.map(a => ({
    //                             id: a.id,
    //                             title: a.title,
    //                             author: a.author,
    //                             coverImage: a.coverImage
    //                         }))
    //                     }
    //                 }
    //             )
    //         };
    //     }
    // }
}

export const Articles = new ArticleService();

/**
 * 根据日期计算征文周期信息
 * 规则：
 * 每月1日开始投稿
 * 当月最后一天停止投稿
 * 下月10日停止投票
 */
export function getContestInfoByDate(now = new Date()) {

    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11

    const submissionStart =
        new Date(year, month, 1, 0, 0, 0);

    const submissionEnd =
        new Date(year, month + 1, 0, 23, 59, 59);

    const voteEnd =
        new Date(year, month + 1, 10, 23, 59, 59);

    const period =
        `${year}-${String(month + 1).padStart(2, "0")}`;

    return {
        year,
        month: month + 1,
        period,
        submissionStart,
        submissionEnd,
        voteEnd,
    };
}
