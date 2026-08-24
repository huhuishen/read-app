import { Settings } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type SettingItemInput = { key: string; value: unknown };

function toSettingObject(items: Array<{ key: string; value: unknown }>) {
    return Object.fromEntries(items.map((item) => [item.key, item.value]));
}

export const GET: RequestHandler = async (event) => {
    if (!event.locals.user) return json({ message: "Unauthorized" }, { status: 401 });
    if (!event.locals.user.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const items = await Settings.getItems();
    const settings = toSettingObject(items);

    return json({
        items,
        ...settings,
    });
};

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return json({ message: "Unauthorized" }, { status: 401 });
    if (!event.locals.user.roles?.includes('administrator')) return json({ message: "Forbidden" }, { status: 403 });

    const body = await event.request.json() as { items?: SettingItemInput[] };
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
        return json({ message: 'items must be a non-empty array' }, { status: 400 });
    }

    let savedItems: Array<{ key: string; value: unknown }>;
    try {
        savedItems = await Settings.setItems(items);
    } catch (error) {
        return json({ message: error instanceof Error ? error.message : 'invalid settings payload' }, { status: 400 });
    }
    const settings = toSettingObject(savedItems);

    return json({
        items: savedItems,
        ...settings,
    });
};
