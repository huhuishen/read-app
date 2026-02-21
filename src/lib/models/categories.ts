import { type Entity } from "$lib/mongolite";
import { Articles } from "./articles";
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
    description?: string;
    show: boolean; // 是否首页显示
    level: 0 | 1 | 2;
    order: number; // 首页排序
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

    async build(name: string, size: number = 5, show: boolean = true) {
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

    async get() {
        // return await super.find({}).sort({ createdAt: -1 }).toArray();
        const res = await super.aggregate([
            {
                $facet: {
                    hasPreview: [
                        { $match: { previewSize: { $gt: 0 } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 }
                    ],
                    noPreview: [
                        { $match: { previewSize: 0 } },
                        { $sort: { name: 1 } },
                        { $limit: 20 }
                    ]
                }
            }
        ]);
        return res[0];
    }

    async at(name: string) {
        // 1. 查询拥有该标签的所有文章ID
        const articles = await Articles.find(
            { categories: name, isLatest: true, status: "published" },
            { projection: { id: 1, title: 1, author: 1, coverImage: 1, createdAt: 1 } }
        ).toArray();

        const articleIds = articles.map(doc => doc.id);

        // 2. 查询这些文章的所有评论
        const comments = await Comments.find(
            { articleId: { $in: articleIds } }
        ).toArray();

        return { articles, comments }
    }
}

export const Categories = new CategoryService();