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

export type Article = {
    id: string;
    version: number;
    isLatest: boolean;
    title: string;
    authorId: string;
    author: string;
    content: string;
    coverImage: string;
    summary: string;
    categories: string[],
    status: "draft" | "pending" | "published" | "scheduled"

    viewCount: number;
    bookmarkCount: number;
    commentCount: number;
    voteCount: number;

    rating: number;
    ratingSum: number;
    ratingCount: number;
    avgRating: number;

    bookmarked: boolean;
    voted: boolean;
    readSeconds: number;
    completion: number;
} & Entity;

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
            { categories: name, isLatest: true, status: "published" },
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

        article.rating = article.ratingSum / article.ratingCount * 2;

        // 划线评论是跟随
        const underlines = await Underlines.findByArticle(article.id, article.version);
        const stats = await ArticleUserStats.getState(article.id, user.id!);

        return { article: { ...article, ...stats }, underlines, };
    }


    private buildAccessFilter(articleId: string, user: Partial<User>) {

        if (user.roles?.includes('administrator')) {
            return {
                id: articleId,
                isLatest: true
            };
        }

        return {
            id: articleId,
            isLatest: true,
            $or: [
                { status: 'published' },
                { authorId: user.id }
            ]
        };
    }

    async syncArticleCategories(
        articleId: string,
        oldCategories: string[],
        newCategories: string[]
    ) {
        const added = newCategories.filter(c => !oldCategories.includes(c));
        const removed = oldCategories.filter(c => !newCategories.includes(c));

        if (added.length > 0) {
            await Categories.updateMany(
                { name: { $in: added } },
                { $inc: { articleCount: 1 } }
            );
        }

        if (removed.length > 0) {
            await Categories.updateMany(
                { slug: { $in: removed } },
                { $inc: { articleCount: -1 } }
            );
        }

        await this.updatePreviewArticles([...added, ...removed]);
    }

    async updatePreviewArticles(names: string[]) {
        for (const name of names) {
            const category = await Categories.findOne({ name });

            if (!category) continue;

            const articles = await Articles.find(
                { categories: name },
                {
                    projection: {
                        title: 1,
                        author: 1,
                        coverImage: 1
                    }
                }
            )
                .sort({ createdAt: -1 })
                .limit(category.previewSize ?? 8)
                .toArray();

            if (category.size == "lg") {
                await Categories.updateOne(
                    { name },
                    {
                        $set: {
                            previewArticles: articles.map(a => ({
                                id: a.id,
                                title: a.title,
                                author: a.author,
                                coverImage: a.coverImage
                            }))
                        }
                    }
                )
            };
        }
    }
}

export const Articles = new ArticleService();

