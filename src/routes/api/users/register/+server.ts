import { Logs, Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const req = await request.json();

    const email = req.email;
    const name = req.name;
    const password = req.password;

    if (!email || !password || !name) {
        return json(
            { error: '昵称、邮箱和密码是必填项' },
            { status: 400 }
        );
    }

    try {
        const [res, user] = await Users.add(email, name, password);

        if (!res.acknowledged) {
            return json(
                { error: '注册失败，请稍后重试' },
                { status: 500 }
            );
        }

        // await sendActivateMail(email, user.activateToken!);

        // await Logs.add({
        //     uid: user.id,
        //     event: "register"
        // });

        return json(
            { message: "注册成功，请查收邮箱激活" },
            { status: 200 }
        );

    } catch (error: any) {
        return json(
            { message: error.message ?? "服务器错误" },
            { status: 500 }
        );
    }
};
