import { cookieOptions } from '$lib/config';
import { Users, type User } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const POST: RequestHandler = withApi(async ({ request, cookies }) => {
    const req = await request.json();

    const email = req.email;
    const password = req.password;

    if (!email || !password) {
        return json({ message: "邮箱和密码是必填项" }, { status: 400 });
    }

    // 查找用户
    const user = await Users.findOne({ email }, { projection: { _id: 0 } });
    if (!user) {
        return json({ message: "邮箱或密码错误" }, { status: 400 });
    }

    // 验证密码
    const valid = await Users.verifyPassword(password, user.password);
    if (!valid) {
        return json({ message: "邮箱或密码错误" }, { status: 400 });
    }

    // if (!user.activated) {
    //     return json({ message: "请先激活邮箱" }, { status: 403 });
    // }

    // 生成JWT token
    const sessionUser: Partial<User> = {
        id: user.id!.toString(),
        email: user.email,
        name: user.name,
        title: user.title,
        award: user.award,
        roles: user.roles,
        // visitorId: visitorId
    };

    const token = Users.generateToken(sessionUser);

    // const event = {
    //     uid: user.id, event: "login"
    // };
    // Logs.add(event as Log);

    // 设置cookie
    cookies.set('token', token, {
        ...cookieOptions, maxAge: 60 * 60 * 24 * 7 // 7天
    });

    return json(sessionUser);
});