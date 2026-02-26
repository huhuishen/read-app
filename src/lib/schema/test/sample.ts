import { Infer, t } from "../index";

const UserDoc = t.object({
    _id: t.string(),
    name: t.string(),
    age: t.number(),
    tags: t.array(t.string()),       // optional
    role: t.array(t.union(
        t.literal("administrator"),
        t.literal("manager"),
        t.literal("review"),
        t.literal("audit"),
        t.literal("user"),
        t.literal("guest"),
    )),
});

type User = Infer<typeof UserDoc>;


let user: Partial<User> = {
    name: "1",
    role: ["user"]
}

try {
    let doc = { name: "1", age: 110, tags: [`1@`, "1654.52"], extra: 1, role: ["user"] }
    const r = UserDoc.check(doc,
        {
            required: ['name'],
            predicates: [
                {
                    path: 'tags[0]',
                    check: v => v.includes('@'),
                    message: 'invalid email'
                },
                {
                    path: 'age',
                    check: v => v <= 120,
                    message: 'age too large'
                }
            ]
        }
    );
    console.log(r);

    t.string().check("as@df1",
        {
            predicates: [{
                check: v => v.includes('@'),
                message: 'must have @'
            },
            {
                check: v => v.length > 5,
                message: 'must have 6 chars'
            }]
        })
} catch (error) {
    console.log(error);
}