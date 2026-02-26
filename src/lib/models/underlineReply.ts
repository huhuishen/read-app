import type { Entity } from "$lib/mongolite";
import type { ObjectId } from "mongodb";
import { Collection } from "./db";
import { Users } from "./users";


export type UnderlineReply = {
    articleId: string,
    parentId: ObjectId | string,
    userId: string,
    user: string,
    content: string,
    likes: number,
    replyTo: string;
    quote: string;
} & Entity

export class UnderlineReplyService extends Collection<UnderlineReply> {
    constructor() {
        super("underline_replies");

        super.createIndex(
            { articleId: 1, parentId: 1, userId: 1, createdAt: -1 },
        )
    }

    async add(doc: UnderlineReply) {
        const docChecked = {
            articleId: doc.articleId,
            parentId: super.id(doc.parentId),
            content: doc.content,
            user: doc.user,
            userId: doc.userId,
            createdAt: doc.createdAt,
            ...(doc.quote != null && { quote: doc.quote }),
            ...(doc.replyTo != null && { replyTo: doc.replyTo }),
        }

        const r = await super.insertOne(docChecked);

        await Users.updateOne({ id: doc.userId }, { $inc: { underlineReplyCount: 1 } });
        return r;
    }

    async remove(id: string) {
        const _id = super.id(id);

        const r = await super.deleteOne({
            _id,
        });
        console.log(r);

        return r;
    }
}

export const UnderlineReplies = new UnderlineReplyService();