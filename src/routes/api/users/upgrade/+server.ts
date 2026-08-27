import { json, type RequestHandler } from '@sveltejs/kit';
import { Users } from '$lib/models';
import { getSession, createSession, SESSION_TTL_MS } from '$lib/auth/session';
import { SESSION_COOKIE } from '$lib/auth/session';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
    if (!locals.user) {
        return json({ message: "未登录" }, { status: 401 });
    }

    if (!locals.user.roles?.includes("guest")) {
        return json({ message: "当前账号已是正式用户" }, { status: 400 });
    }

    const req = await request.json() as Record<string, unknown>;
    const email = String(req.email ?? "").trim();
    const name = String(req.name ?? "").trim();
    const password = String(req.password ?? "");

    if (!email || !name || !password) {
        return json({ message: "邮箱、用户名和密码均为必填项" }, { status: 400 });
    }

    if (password.length < 6) {
        return json({ message: "密码至少需要 6 位" }, { status: 400 });
    }

    try {
        const userId = locals.user.id!;
        const updated = await Users.upgradeGuest(userId, email, name, password);

        if (!updated) {
            return json({ message: "转正失败，用户不存在" }, { status: 400 });
        }

        const sessionId = cookies.get(SESSION_COOKIE);
        if (sessionId) {
            const session = await getSession(sessionId);
            if (session) {
                session.user = {
                    id: updated.id!,
                    email: updated.email,
                    name: updated.name,
                    roles: updated.roles,
                    profile: updated.profile,
                };
                const now = Date.now();
                await createSession(sessionId, {
                    ...session,
                    lastSeenAt: now,
                    expiresAt: now + SESSION_TTL_MS,
                });
            }
        }

        return json({ message: "转正成功" });
    } catch (e: any) {
        return json({ message: e.message || "转正失败" }, { status: 400 });
    }
};
