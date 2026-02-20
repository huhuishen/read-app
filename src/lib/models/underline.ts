import { type Entity } from "$lib/mongolite";
import { Collection } from "./db";


export type UnderlineRange = {
    start: number;
    end: number;
};

export type Underline = {
    articleId: string;
    version: number;
    segment: number;
    ranges: UnderlineRange[];
    revision: number;     // CAS 核心字段
} & Entity;


export type UnderlineSel = {
    segment: number;
    text: string;
} & UnderlineRange;

export class UnderlineService extends Collection<Underline> {
    constructor() {
        super("underlines");

        super.createIndex(
            { articleId: 1, version: 1, segment: 1 },
            { unique: true }
        )
    }

    findByArticle(articleId: string, version: number) {
        return this.find({ articleId, version },
            {
                projection: { _id: 0, segment: 1, ranges: 1 },
                sort: { segment: 1 }
            }
        ).toArray();
    }

    mergeIntoRanges(
        ranges: UnderlineRange[],
        newStart: number,
        newEnd: number
    ): UnderlineRange[] {
        const result: UnderlineRange[] = [];
        let inserted = false;

        for (const r of ranges) {
            if (r.end < newStart) {
                result.push(r);
            } else if (r.start > newEnd) {
                if (!inserted) {
                    result.push({ start: newStart, end: newEnd });
                    inserted = true;
                }
                result.push(r);
            } else {
                newStart = Math.min(newStart, r.start);
                newEnd = Math.max(newEnd, r.end);
            }
        }

        if (!inserted) {
            result.push({ start: newStart, end: newEnd });
        }

        return result;
    }

    async addUnderlineWithCAS(
        articleId: string,
        version: number,
        segment: number,
        newStart: number,
        newEnd: number
    ) {
        for (let attempt = 0; attempt < 3; attempt++) {
            // 1️⃣ 读取当前 document
            const doc = await super.findOne({
                articleId,
                version,
                segment
            });

            // 2️⃣ 如果不存在，尝试直接创建
            if (!doc) {
                try {
                    const ranges = [{ start: newStart, end: newEnd }];
                    await super.insertOne({
                        articleId,
                        version,
                        segment,
                        ranges,
                        revision: 1,
                    });
                    return ranges;
                } catch (e: any) {
                    // 并发创建冲突，继续重试
                    if (e.code === 11000) continue;
                    throw e;
                }
            }

            // 3️⃣ 内存合并
            const mergedRanges = this.mergeIntoRanges(
                doc.ranges,
                newStart,
                newEnd
            );

            // 4️⃣ CAS 更新（Compare And Swap）
            const result = await super.updateOne(
                {
                    articleId,
                    version,
                    segment,
                    revision: doc.revision   // Compare
                },
                {
                    $set: {
                        ranges: mergedRanges,
                    },
                    $inc: {
                        revision: 1           // Swap
                    }
                }
            );

            // 5️⃣ 成功
            if (result.modifiedCount === 1) {
                return mergedRanges;
            }

            // 6️⃣ 失败说明被并发修改，自动重试
        }

        throw new Error("CAS update failed after max retries");
    }
}

export const Underlines = new UnderlineService();