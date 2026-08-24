import { Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const user = await Users.findOne(
        { id: event.params.id },
        { projection: { _id: 0, id: 1, email: 1 } },
    );

    if (!user) {
        return json({ message: '用户不存在' }, { status: 404 });
    }

    const token = crypto.randomUUID().replaceAll('-', '');
    const expireAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await Users.updateOne(
        { id: event.params.id },
        {
            $set: {
                resetPasswordToken: token,
                resetPasswordExpireAt: expireAt,
            },
        } as any,
    );

    const resetUrl = `${event.url.origin}/reset/${token}`;

    return json({
        message: '密码重置请求已创建',
        resetUrl,
        expireAt: expireAt.toISOString(),
        email: user.email,
    });
};
