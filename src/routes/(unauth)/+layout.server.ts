import { cookieOptions } from '$lib/config';
import { Users } from '$lib/models';
import { safe } from '$lib/util/safe';
import type { LayoutServerLoad } from './$types';


export const load: LayoutServerLoad = ({ cookies }) => {
    return safe(() => {
        // 页面打开，以下代码只会运行一次
        const token = cookies.get('token');
        const user = Users.verifyToken(token || '');
        // console.log(user);

        if (!user) {
            cookies.delete('token', cookieOptions);
            return { user: null };
        }

        return { user };
    });
};