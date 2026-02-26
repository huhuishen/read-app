import { type Entity } from "$lib/mongolite";
import type { ObjectId } from "mongodb";
import { Articles } from "./articles";
import { Comments } from "./comments";
import { Collection } from "./db";
import { UnderlineComments } from "./underlineComments";

// export const CommentLikeSchema = t.object({
//     commentId: t.objectId(),
//     userId: t.string(),
//     user: t.string(),
// });

// export type CommentLike = Infer<typeof CommentLikeSchema> & Entity ;

export type CommentLike = {
    commentId: ObjectId | string,
    userId: string,
    user: string,
} & Entity


export class CommentLikeService extends Collection<CommentLike> {
    constructor() {
        super("comment_likes");

        super.createIndex(
            { commentId: 1, createdAt: -1 },
        )

        super.createIndex(
            { commentId: 1, userId: 1 },
            { unique: true }
        )
    }

    // async add(commentId: string, userId: string, user: string) {
    //     const _id = super.id(commentId);
    //     const r = await super.insertOne({ commentId: _id, userId, user });

    //     if (r.acknowledged) {
    //         await Comments.updateOne(
    //             { _id },
    //             { $inc: { likes: 1 } }
    //         );
    //     }
    // }
    async toggleLike(
        commentId: string,
        userId: string,
        user: string,
        targetCollection: { updateOne: Function }
    ) {
        const _id = super.id(commentId);

        // 1️⃣ 尝试删除（取消点赞）
        const deleteResult = await super.deleteOne({
            commentId: _id,
            userId
        });

        if (deleteResult.deletedCount === 1) {
            // 已存在 → 执行取消
            await targetCollection.updateOne(
                { _id },
                { $inc: { likes: -1 } }
            );

            return {
                liked: false
            };
        }

        // 2️⃣ 不存在 → 尝试插入（点赞）
        try {
            const insertResult = await super.insertOne({
                commentId: _id,
                userId,
                user
            });

            if (insertResult.acknowledged) {
                await targetCollection.updateOne(
                    { _id },
                    { $inc: { likes: 1 } }
                );

                return {
                    liked: true
                };
            }
        } catch (e: any) {
            // 唯一索引冲突（并发情况下）
            if (e.code === 11000) {
                return { liked: true };
            }
            throw e;
        }
    }

    async remove(id: string, userId: string,) {
        if (!userId) return;
        // const userId = super.id(uid);

        const r = await super.deleteOne({
            articleId: id,
            userId,
        });

        // if (r.deletedCount === 1) {
        //     await Articles.updateCommentCount(id, -1);
        // }
    }
}

export const CommentLikes = new CommentLikeService();