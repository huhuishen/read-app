import { type Entity } from "$lib/mongolite";
import { Collection } from "./db";


export type UserDailyActivity = {
    userId: string
    date: string   // YYYY-MM-DD
    readMs: number
    readMinutes: number
} & Entity


export class UserDailyActivityService extends Collection<UserDailyActivity> {
    constructor() {
        super("user_daily_activities");

        super.createIndex(
            { userId: 1, date: 1 },
            { unique: true }
        )
    }

    // 每次记录 read 时更新
    async updateDailyActivity(userId: string, readMs: number, date: Date) {
        const day = date.toISOString().slice(0, 10)

        await super.updateOne(
            {
                userId,
                date: day
            },
            {
                $inc: {
                    readMs,
                    readMinutes: readMs / 60000
                },
                $set: {
                    updatedAt: new Date()
                }
            },
            {
                upsert: true
            }
        )
    }

    // 取最近 limit 天的活跃数据（按日期倒序）
    async getRecentDays(userId: string, limit = 365) {
        const docs = await super.find(
            { userId },
            { projection: { _id: 0, date: 1, readMinutes: 1 } }
        )
            .sort({ date: -1 })
            .limit(limit)
            .toArray();

        return docs.map(d => ({
            date: d.date,
            readMinutes: Math.round(d.readMinutes ?? 0)
        }));
    }
}

export const UserDailyActivities = new UserDailyActivityService();
