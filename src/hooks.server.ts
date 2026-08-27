import { initDb } from "$lib/models/db";
import type { Handle, ServerInit } from "@sveltejs/kit";
import {
    SESSION_COOKIE,
    SESSION_TTL_SECONDS,
    touchSession,
} from "$lib/auth/session";
import { extractClientIp } from "$lib/auth/ip";
import { cookieOptions } from "$lib/config";
import { Users } from "$lib/models/users";

export const init: ServerInit = async () => {
    await initDb();
    try {
        const res = await Users.cleanupExpiredGuests(7);
        if (res.deletedCount > 0) {
            console.log(`[Bootstrap] Cleaned up ${res.deletedCount} expired guest users`);
        }
    } catch {
        /* 清理失败不影响启动 */
    }
};

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(SESSION_COOKIE);
    let user: App.Locals["user"] = null;

    if (sessionId) {
        const ip = extractClientIp(
            event.request.headers,
            event.getClientAddress()
        );
        const userAgent = event.request.headers.get("user-agent") ?? undefined;

        const session = await touchSession(sessionId, { ip, userAgent });

        if (session) {
            user = session.user as App.Locals["user"];
            // 滑动续期：每次成功的 touch 都已更新过期时间，
            // 这里同步刷新 cookie 的 max-age，保持浏览器端一致
            event.cookies.set(SESSION_COOKIE, sessionId, {
                ...cookieOptions,
                maxAge: SESSION_TTL_SECONDS,
            });
        } else {
            // 会话无效/过期/被劫持，清除残留 cookie
            event.cookies.delete(SESSION_COOKIE, cookieOptions);
        }
    }

    event.locals.user = user;
    return resolve(event);
};
