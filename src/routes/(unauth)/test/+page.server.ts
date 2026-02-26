import { Articles, Users } from "$lib/models";
import { ensureObjectId } from '$lib/mongolite/helpers.js';
import { nanoid } from "$lib/util/client";

export const load = async ({ fetch, params, url }) => {
    // const response = await fetch(`/api/user/${params.id}`);
    // if (!response.ok) {
    //     error(401, '权限不足');
    // }
    // const res = await response.json();
    // const dr = await Users.deleteMany({});

    // let res = await Users.insertOne({
    //     name: "1",
    //     metadata: { role: "user" },
    // });

    // let res2 = await Users.insertMany([{
    //     name: "asdf",
    //     metadata: { role: "user" },
    // }, {
    //     name: "23123",
    //     metadata: { role: "admin" },
    // }
    // ]);

    // let res3 = await Users.find({}, { projection: { _id: 0 } })
    // let res3 = await Users.find({ _id: ensureObjectId("693ac78b9469d474356f8473") })
    // let res3 = await Users.findPage({}, { page: 1, limit: 30, })

    // let update = await Users.updateOne({ _id: ensureObjectId("693ac78b9469d474356f8473") }, { $set: { name: new Date().toString() } });
    // return {
    //     users: JSON.parse(JSON.stringify(res3.data)),
    //     page: update
    // };

    // const cursor = Articles.find({}, { projection: { _id: 1 } })
    // while (await cursor.hasNext()) {
    //     const doc = await cursor.next();
    //     if (!doc) continue;

    //     Articles.updateOne(
    //         { _id: doc._id },
    //         { $set: { articleId: nanoid() } }
    //     );
    // };
};
