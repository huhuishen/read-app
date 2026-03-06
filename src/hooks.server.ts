import { initDb } from "$lib/models/db";
import type { ServerInit } from "@sveltejs/kit";

export const init: ServerInit = async () => {
    console.log("init");
    
    await initDb();
};
