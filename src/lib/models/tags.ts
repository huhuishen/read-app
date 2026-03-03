import { type Entity } from "$lib/mongolite";
import { Articles } from "./articles";
import { Collection } from "./db";

export type Tag = {
    name: string;
    show: boolean;
    articleCount: number;
} & Entity;

export class TagService extends Collection<Tag> {
    constructor() {
        super("tags");
        super.createIndex({ name: 1 }, { unique: true });
    }

    async ensureExists(name: string) {
        return await super.updateOne(
            { name },
            {
                $setOnInsert: {
                    name,
                    show: true,
                    articleCount: 0,
                },
            },
            { upsert: true }
        );
    }

    async addArticle(tags: string[] = []) {
        const normalizedTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
        if (normalizedTags.length === 0) return;

        await Promise.all(
            normalizedTags.map((name) =>
                super.updateOne(
                    { name },
                    {
                        $setOnInsert: { name, show: true, articleCount: 0 },
                        $inc: { articleCount: 1 },
                    },
                    { upsert: true }
                )
            )
        );
    }

    async buildCount(name: string, show: boolean = true) {
        const articleCount = await Articles.countDocuments({
            tags: name,
            isLatest: true,
        });

        return await super.updateOne(
            { name },
            {
                $set: {
                    name,
                    show,
                    articleCount,
                },
            },
            { upsert: true }
        );
    }
}

export const Tags = new TagService();
