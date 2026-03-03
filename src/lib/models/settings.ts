import { type Entity } from "$lib/mongolite";
import { t, type Infer } from "$lib/schema";
import { SimpleCache } from "$lib/util/cache";
import { Collection } from "./db";

const SYSTEM_SETTINGS_ID = "system";

export const SettingsSchema = t.object({
    id: t.string(),
    autoPublishWithoutReview: t.boolean(),
});

export type Settings = Infer<typeof SettingsSchema> & Entity;

export class SettingsService extends Collection<Settings> {
    constructor() {
        super("settings");
        super.createIndex({ id: 1 }, { unique: true });
    }

    cache = new SimpleCache();

    private async getOrCreateSystemSettings() {
        const existing = await super.findOne(
            { id: SYSTEM_SETTINGS_ID },
            { projection: { _id: 0 } },
        );
        if (existing) return existing;

        const defaults: Partial<Settings> = {
            id: SYSTEM_SETTINGS_ID,
            autoPublishWithoutReview: false,
        };

        await super.updateOne(
            { id: SYSTEM_SETTINGS_ID },
            { $setOnInsert: defaults },
            { upsert: true },
        );

        return (await super.findOne(
            { id: SYSTEM_SETTINGS_ID },
            { projection: { _id: 0 } },
        )) as Settings;
    }

    async getSystemSettings() {
        return this.cache.get(
            SYSTEM_SETTINGS_ID,
            async () => await this.getOrCreateSystemSettings(),
        );
    }

    async setAutoPublishWithoutReview(value: boolean) {
        await super.updateOne(
            { id: SYSTEM_SETTINGS_ID },
            {
                $set: { autoPublishWithoutReview: value },
                $setOnInsert: { id: SYSTEM_SETTINGS_ID },
            },
            { upsert: true },
        );

        this.cache.delete(SYSTEM_SETTINGS_ID);
        return await this.getSystemSettings();
    }
}

export const Settings = new SettingsService();

