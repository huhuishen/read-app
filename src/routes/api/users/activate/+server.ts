import { Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const { token } = await request.json();

    if (!token) {
        return json({ error: "无效 token" }, { status: 400 });
    }

    const user = await Users.findOne({ activateToken: token });

    if (!user) {
        return json({ error: "激活链接无效" }, { status: 400 });
    }

    if (user.activated) {
        return json({ message: "已激活" }, { status: 200 });
    }

    if (new Date(user.activateExpireAt) < new Date()) {
        return json({ error: "激活链接已过期" }, { status: 400 });
    }

    await Users.updateOne(
        { id: user.id },
        {
            $set: {
                activated: true
            },
            $unset: {
                activateToken: "",
                activateExpireAt: ""
            }
        }
    );

    return json({ message: "激活成功" }, { status: 200 });
};
