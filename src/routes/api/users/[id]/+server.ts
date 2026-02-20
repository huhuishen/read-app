import { Users } from '$lib/models';
import { withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = withApi(async ({ params }) => {
    const user = await Users.findOne(
        {
            id: params.id,
        },
        { projection: { _id: 0, password: 0 } });

    return json(user);
});


export async function POST({ cookies, params }) {

    try {
        // const res = await Users.updateMany({}, { $set: { authorId: nanoid() } })

        // 给每个文档添加属性
        // const cursor = Users.find({}, { projection: { _id: 1 } })
        // while (await cursor.hasNext()) {
        //     const doc = await cursor.next();
        //     if (!doc) continue;

        //     Users.updateOne(
        //         { _id: doc._id },
        //         { $set: { id: nanoid() } }
        //     );
        // };

        //     return json({ ok: true }, { status: 200 });

        // Users.renameField('account', 'email')
        // Users.renameField('authorId', 'id')
        // Articles.renameField("tags","categories");

        return json({});
    } catch (error) {
        return json({ error: error }, { status: 500 });
    }
}

