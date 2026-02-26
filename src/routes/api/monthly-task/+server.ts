// src/routes/api/monthly-task/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/models';

export async function POST() {
    // ✅ 幂等保护（防止重复执行）
    const today = new Date().toISOString().slice(0, 7); // 2025-12

    const exists = await db.collection('task_logs').findOne({
        type: 'monthly',
        month: today
    });

    if (exists) {
        return json({ ok: true, skipped: true });
    }

    // ✅ 你的 MongoDB 任务逻辑
    // await db.collection('orders').updateMany(
    //     { status: 'pending' },
    //     { $set: { status: 'expired' } }
    // );

    // ✅ 记录日志
    await db.collection('task_logs').insertOne({
        type: 'monthly',
        month: today,
        createdAt: new Date()
    });

    return json({ ok: true });
}


// 配置 Linux Crontab（每月第一天 00:00 执行）
// crontab - e

// 添加：
// 0 0 1 * * curl - X POST https://yourdomain.com/api/monthly-task

// 语义：
// 字段	含义
// 0	分钟
// 0	小时
// 1	每月第一天
//     * 每月
//     * 每周