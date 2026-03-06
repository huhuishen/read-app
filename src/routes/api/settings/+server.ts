import { apiError, requireUser, withApi } from '$lib/util/apiHandler';
import { Settings } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type SettingItemInput = { key: string; value: unknown };

function ensureAdministrator(user: { roles?: string[] }) {
    if (!user.roles?.includes('administrator')) {
        apiError(403, 'Forbidden');
    }
}

function toSettingObject(items: Array<{ key: string; value: unknown }>) {
    return Object.fromEntries(items.map((item) => [item.key, item.value]));
}

export const GET: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    ensureAdministrator(user);

    const items = await Settings.getItems();
    const settings = toSettingObject(items);

    return json({
        items,
        ...settings,
    });
});

export const POST: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    ensureAdministrator(user);

    const body = await event.request.json() as { items?: SettingItemInput[] };
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
        apiError(400, 'items must be a non-empty array');
    }

    let savedItems: Array<{ key: string; value: unknown }>;
    try {
        savedItems = await Settings.setItems(items);
    } catch (error) {
        apiError(400, error instanceof Error ? error.message : 'invalid settings payload');
    }
    const settings = toSettingObject(savedItems);

    return json({
        items: savedItems,
        ...settings,
    });
});
