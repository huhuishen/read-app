import { Users } from '$lib/models';
import type { Cookies } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export function getUser(cookies: Cookies) {
    const token = cookies.get('token') || '';
    const user = Users.verifyToken(token);
    return user;
}

// export function checkUser(cookies: Cookies) {
//     const { user } = getUser(cookies);

//     if (!user) {
//         throw new SafeError(400, '用户未登录', user);
//     }

//     return user;
// }

// export async function checkUser(cookies: Cookies): Promise<AuthUser> {
//     const token = cookies.get('auth_token');

//     if (!token) {
//         const err: any = new Error('未登录');
//         err.status = 401;
//         throw err;
//     }

//     try {
//         const payload: any = await verifyToken(token);

//         return {
//             id: payload.sub,
//             name: payload.name,
//             role: payload.role
//         };
//     } catch (e) {
//         const err: any = new Error('登录已过期');
//         err.status = 401;
//         throw err;
//     }
// }

export function withApi<T extends (...args: any) => any>(handler: T): T {
    return (async (event: any) => {
        try {
            const user = getUser(event.cookies);
            event.locals.user = user;

            const result = await handler(event);

            if (result instanceof Response) {
                return result;
            }

            return json(result);
        } catch (err: any) {
            return json(
                { message: err?.message ?? '服务器错误', },
                { status: err?.status ?? 500 }
            );
        }
    }) as T;
}