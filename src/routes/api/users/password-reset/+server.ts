import { Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const body = (await request.json()) as {
        token?: unknown;
        password?: unknown;
    };

    const token = String(body.token ?? '').trim();
    const password = String(body.password ?? '');

    if (!token) {
        return json({ message: '重置令牌不能为空' }, { status: 400 });
    }

    if (password.length < 6) {
        return json({ message: '密码至少 6 位' }, { status: 400 });
    }

    const user = await Users.findOne(
        { resetPasswordToken: token } as any,
        { projection: { _id: 0, id: 1, resetPasswordExpireAt: 1 } as any },
    );

    if (!user) {
        return json({ message: '重置链接无效' }, { status: 400 });
    }

    const expireAt = new Date((user as any).resetPasswordExpireAt ?? 0);
    if (!expireAt.getTime() || expireAt.getTime() < Date.now()) {
        return json({ message: '重置链接已过期' }, { status: 400 });
    }

    const passwordHash = await Users.hashPassword(password);

    await Users.updateOne(
        { id: user.id },
        {
            $set: { password: passwordHash },
            $unset: {
                resetPasswordToken: '',
                resetPasswordExpireAt: '',
            },
        } as any,
    );

    return json({ message: '密码重置成功' });
};
