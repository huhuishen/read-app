import { type Entity } from "$lib/mongolite";
import { Collection } from "./db";


export type UserDailyActivity = {
    userId: string
    date: string   // YYYY-MM-DD
    duration: number
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
}

export const UserDailyActivities = new UserDailyActivityService();