import { Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cookieOptions } from '$lib/config';

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        const token = cookies.get('token');
        const user = Users.verifyToken(token || '');

        if (!user) {
            cookies.delete('token', cookieOptions);
            return json({ error: '无效的认证令牌' }, { status: 401 });
        }

        return json(user, { status: 200 });
    } catch (error) {
        return json({ error }, { status: 500 });
    }
};