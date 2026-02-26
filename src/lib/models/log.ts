import { type Entity } from "$lib/mongolite";
import { t, type Infer } from "$lib/schema";
import { Collection } from "./db";



export const LogSchema = t.object({
    uid: t.string(),
    aid: t.string(),
    event: t.union(
        t.literal("register"),
        t.literal("login"),
        t.literal("logout"),
        t.literal("read"),
        t.literal("bookmark"),
        t.literal("vote"),
        t.literal("like"),
        t.literal("follow"),),
});

export type Log = Infer<typeof LogSchema> & Entity

export class LogService extends Collection<Log> {
    constructor() {
        super("logs");

        super.createIndex({ uid: 1 });
        super.createIndex({ aid: 1 });
        super.createIndex({ event: 1 });
        super.createIndex({ aid: 1, uid: 1, event: 1 });
    }

    async add(uid: string | undefined, aid: string | undefined, event: Log["event"]) {

    }
}

export const Logs = new LogService();