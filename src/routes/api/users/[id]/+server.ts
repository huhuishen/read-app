import { Users } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const roleValues = [
    'administrator',
    'editor',
    'author',
    'critic',
    'user',
    'guest',
] as const;
type Role = (typeof roleValues)[number];
const allowedRoles = new Set<Role>(roleValues);

export const GET: RequestHandler = async ({ params }) => {
    const user = await Users.findOne(
        {
            id: params.id,
        },
        { projection: { _id: 0, password: 0 } }
    );

    return json(user);
};

export const PATCH: RequestHandler = async (event) => {
    if (!event.locals.user?.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const body = (await event.request.json()) as { roles?: unknown };

    if (!Array.isArray(body.roles)) {
        return json({ message: 'roles must be an array' }, { status: 400 });
    }

    const roles = [
        ...new Set(body.roles.map((item) => String(item).trim())),
    ] as Role[];

    if (roles.length === 0) {
        return json({ message: '至少保留一个角色' }, { status: 400 });
    }

    if (roles.some((role) => !allowedRoles.has(role))) {
        return json({ message: '包含不支持的角色' }, { status: 400 });
    }

    const res = await Users.updateOne(
        { id: event.params.id },
        { $set: { roles } },
    );

    if (res.matchedCount === 0) {
        return json({ message: '用户不存在' }, { status: 404 });
    }

    return json(res);
};

export const POST: RequestHandler = async () => {
    // historical migration endpoint placeholder
    return json({});
};
