import { Users } from '$lib/models';
import { apiError, requireRole, withApi } from '$lib/util/apiHandler';
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

export const GET: RequestHandler = withApi(async ({ params }) => {
    const user = await Users.findOne(
        {
            id: params.id,
        },
        { projection: { _id: 0, password: 0 } }
    );

    return json(user);
});

export const PATCH: RequestHandler = withApi(async (event) => {
    requireRole(event, 'administrator');

    const body = (await event.request.json()) as { roles?: unknown };

    if (!Array.isArray(body.roles)) {
        apiError(400, 'roles must be an array');
    }

    const roles = [
        ...new Set(body.roles.map((item) => String(item).trim())),
    ] as Role[];

    if (roles.length === 0) {
        apiError(400, '至少保留一个角色');
    }

    if (roles.some((role) => !allowedRoles.has(role))) {
        apiError(400, '包含不支持的角色');
    }

    const res = await Users.updateOne(
        { id: event.params.id },
        { $set: { roles } },
    );

    if (res.matchedCount === 0) {
        apiError(404, '用户不存在');
    }

    return json(res);
});

export const POST: RequestHandler = withApi(async () => {
    // historical migration endpoint placeholder
    return json({});
});
