import { type Entity } from "$lib/mongolite";
import type { ObjectId } from "mongodb";
import { Articles } from "./articles";
import { CommentLikes } from "./commentLike";
import { Collection } from "./db";
import { Users, type User } from "./users";


// export const ReplySchema = t.object({
//     id: t.string(),
//     userId: t.string(),
//     user: t.string(),
//     content: t.string(),
//     createdAt: t.date(),
// });

// export const CommentSchema = t.object({
//     userId: t.string(),
//     user: t.string(),
//     content: t.string(),
//     articleId: t.string(),
//     parentId: t.string(),   // null = 一级评论
//     rating: t.number(),
//     likes: t.number(),
//     // quote: t.string(),
//     // replyTo: t.string(),
//     // replies: t.array(ReplySchema),
// });

// export type Reply = Infer<typeof ReplySchema>;
// export type Comment = Infer<typeof CommentSchema> & Entity & { liked: boolean };


export type Comment = {
    articleId: string,
    parentId: ObjectId | string | null, // null = 一级评论
    userId: string,
    user: string,
    content: string,
    rating: number,
    likes: number,
    liked: boolean,          // 只在返回数据中组装
    replies: Partial<Comment>[],      // 只在返回数据中组装
    replyTo: string;
    quote: string;
} & Entity

export class CommentService extends Collection<Comment> {
    constructor() {
        super("comments");

        super.createIndex(
            { articleId: 1, parentId: 1, userId: 1, createdAt: -1 },
        )

        // super.createIndex(
        //     { articleId: 1, parentId: 1, userId: 1 },
        //     { unique: true }
        // )
    }

    async add(doc: Comment, user: Partial<User>) {
        doc.userId = user.id!;
        doc.user = user.name!;
        if (doc.parentId) doc.parentId = super.id(doc.parentId);

        const r = await super.insertOne(doc);

        if (doc.rating) {
            await Articles.updateOne({ id: doc.articleId },
                {
                    $inc: {
                        ratingSum: doc.rating,
                        ratingCount: 1,
                        commentCount: 1,
                    }
                });
        }

        await Users.updateOne({ id: user.id! }, { $inc: { commentCount: 1 } });

        return r;
    }

    async remove(id: string, user: Partial<User> | null) {
        if (!user) return;
        const _id = super.id(id);

        const comment = await Comments.findOne({ _id });
        if (!comment) return;

        const r = await super.deleteOne({
            _id,
            userId: user.id,
        });

        if (r.deletedCount !== 1) return;

        if (comment.rating) {
            await Articles.updateOne({ id: comment.articleId },
                {
                    $inc: {
                        ratingSum: -comment.rating,
                        ratingCount: -1,
                        commentCount: -1,
                    }
                });
        }

        return { ok: true };
    }

    // async get(articleId: string, userId: string) {
    //     // const userId = userId;
    //     const myComment = await super.findOne({ articleId, userId });
    //     const othersComment = await super.find({ articleId, userId: { $ne: userId } }).sort({ createAt: -1 }).toArray();
    //     //        const comment = await super.find({ articleId }).sort({ createAt: -1 }).toArray();

    //     return { myComment, othersComment }
    // }
    // super.aggregate([
    //     { $match: { articleId: articleId } },
    //     {
    //         $set: {
    //             priority: {
    //                 $cond: [{ $eq: ["$userId", userId] }, 0, 1]
    //             }
    //         }
    //     },
    //     { $sort: { priority: 1, createdAt: -1 } },
    //     { $skip: page * 20 },
    //     { $limit: 20 },
    //     { $unset: "priority" }
    // ])
    // async get(articleId: string, userId: string) {
    //     let roots = await super.aggregate([
    //         {
    //             $match: {
    //                 articleId,
    //                 parentId: null
    //             }
    //         },
    //         {
    //             $set: {
    //                 priority: {
    //                     $cond: [{ $eq: ["$userId", userId] }, 0, 1]
    //                 }
    //             }
    //         },
    //         {
    //             $sort: {
    //                 priority: 1,
    //                 createdAt: -1
    //             }
    //         },
    //         // 放在 $lookup 之前，减少 join 数量。
    //         // {
    //         //     $skip: page * pageSize
    //         // },
    //         // {
    //         //     $limit: pageSize
    //         // }
    //         /**
    //          必须存在的索引
    //          db.commentlikes.createIndex(
    //             { commentId: 1, userId: 1 },
    //             { unique: true }
    //             );
    //             否则 $lookup 会退化成全表扫描。
    //          */
    //         {
    //             $lookup: {
    //                 from: "comment_likes",          // CommentLike 集合名
    //                 let: { commentId: "$_id" },
    //                 pipeline: [
    //                     {
    //                         $match: {
    //                             $expr: {
    //                                 $and: [
    //                                     { $eq: ["$commentId", "$$commentId"] },
    //                                     { $eq: ["$userId", userId] }
    //                                 ]
    //                             }
    //                         }
    //                     },
    //                     { $limit: 1 }              // 关键：只要知道存不存在
    //                 ],
    //                 as: "myLike"
    //             }
    //         },
    //         // 查 replies（同一张表）
    //         // {
    //         //     $lookup: {
    //         //         from: "comments",
    //         //         let: { parentId: "$_id" },
    //         //         pipeline: [
    //         //             {
    //         //                 $match: {
    //         //                     $expr: { $eq: ["$parentId", "$$parentId"] }
    //         //                 }
    //         //             },
    //         //             {
    //         //                 $sort: { createdAt: 1 }
    //         //             },
    //         //             // 可加 limit
    //         //             { $limit: 5 }
    //         //         ],
    //         //         as: "replies"
    //         //     }
    //         // },
    //         {
    //             $set: {
    //                 liked: {
    //                     $gt: [{ $size: "$myLike" }, 0]
    //                 }
    //             }
    //         },
    //         {
    //             $unset: ["myLike", "priority"]
    //         },
    //     ]);

    //     let replies = await super.find({
    //         parentId: { $in: roots.map(r => r._id) }
    //     }).toArray();
    // }

    //高性能（两次查询）
    async get(articleId: string, userId: string) {
        // 1 查一级评论（分页 / 排序）
        // const roots = await super.find(
        //     { articleId, parentId: null },
        //     { sort: { createdAt: -1 } }
        // ).toArray();

        const mine = await super.find({
            articleId,
            parentId: { $exists: false },
            userId
        }).sort({ createdAt: -1 }).toArray();

        const others = await super.find({
            articleId,
            parentId: { $exists: false },
            userId: { $ne: userId }
        }).sort({ createdAt: -1 }).toArray();

        const roots = [...mine, ...others];

        // 2 查所有 replies（批量）
        const rootIds = roots.map(c => c._id);

        const replies = await super.find(
            { parentId: { $in: rootIds } },
            { sort: { createdAt: -1 } }
        ).toArray();

        // 3 一次性查「当前用户的所有点赞」
        const allCommentIds = [
            ...rootIds,
            ...replies.map(r => r._id)
        ];

        const likes = await CommentLikes.find(
            {
                commentId: { $in: allCommentIds },
                userId: userId
            },
            { projection: { commentId: 1 } }
        ).toArray();

        const likedSet = new Set(
            likes.map(l => l.commentId.toString())
        );

        // 4 组装 replies（O(n)）
        const replyMap = new Map<string, any[]>();

        for (const r of replies) {
            const pid = r.parentId!.toString();
            if (!replyMap.has(pid)) {
                replyMap.set(pid, []);
            }

            replyMap.get(pid)!.push({
                ...r,
                liked: likedSet.has(r._id.toString())
            });
        }

        // 5 组装最终评论结构（完成）
        const result = roots.map(c => ({
            ...c,
            liked: likedSet.has(c._id.toString()),
            replies: replyMap.get(c._id.toString()) ?? []
        }));

        return result;
    }
}

export const Comments = new CommentService();