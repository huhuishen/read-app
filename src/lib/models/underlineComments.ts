import type { Comment } from "./comments";
import { Collection } from "./db";
import { Underlines } from "./underline";
import { Users } from "./users";


export type UnderlineComment = {
    version: number;
    segment: number;
    start: number;
    end: number;
} & Comment

export class UnderlineCommentService extends Collection<UnderlineComment> {
    constructor() {
        super("underline_comments");

        super.createIndex(
            { articleId: 1, parentId: 1, userId: 1, createdAt: -1 },
        )
        super.createIndex({ articleId: 1, version: 1, segment: 1 });
    }

    async add(doc: UnderlineComment) {
        await super.insertOne(doc);

        await Users.updateOne({ id: doc.userId }, { $inc: { underlineCount: 1 } });

        return await Underlines.addUnderlineWithCAS(
            doc.articleId,
            doc.version,
            doc.segment,
            doc.start,
            doc.end);
    }

    async remove(id: string) {
        const _id = super.id(id);

        const r = await super.deleteOne({
            _id,
        });

        return r;
    }

    // async getUnderlines(articleId: string, userId: string) {
    //     const underlines = await super.find({
    //         articleId,
    //         underline: { $exists: true },
    //     }).sort({ createdAt: -1 }).toArray();

    //     return underlines;
    // }

    // findByArticle(aid: string) {
    //     return super.find({
    //         aid: super.id(aid)
    //     }, { projection: { aid: 0, uid: 0, createdAt: 0 } }).toArray();
    // }

    // findByRange(aid: string, seg: number, start: number = 0, end: number = Infinity) {
    //     return super.find({
    //         aid: super.id(aid),
    //         seg: seg,
    //         start: { $gte: start },
    //         end: { $lte: end }
    //     }, { projection: { aid: 0 } }).toArray();
    // }
}

export const UnderlineComments = new UnderlineCommentService();