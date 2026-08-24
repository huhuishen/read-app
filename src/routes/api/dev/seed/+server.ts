import { seedTestData } from "$lib/models/seed";
import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * 播种测试数据（仅管理员）
 * 支持查询参数 months / perMonth 覆盖默认值
 */
export const POST: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes("administrator")) return json({ message: "Forbidden" }, { status: 403 });

    const months = Number(event.url.searchParams.get("months") ?? 10);
    const perMonth = Number(event.url.searchParams.get("perMonth") ?? 30);

    const result = await seedTestData({ months, perMonth });

    return json(result);
};
