import { initDb } from "$lib/models/db";
import type { ServerInit } from "@sveltejs/kit";

export const init: ServerInit = async () => {
    await initDb();
};
