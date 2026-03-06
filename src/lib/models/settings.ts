import type { Entity } from "$lib/mongolite";
import { Collection } from "./db";

export type Setting = {
    key: string;
    value: unknown;
    type: string;
    default: unknown;
} & Entity;

export const SYSTEM_SETTING_DEFS = {
    autoPublishWithoutReview: {
        key: "autoPublishWithoutReview",
        type: "boolean",
        default: false as boolean,
    },
} as const;

export type SystemSettingName = keyof typeof SYSTEM_SETTING_DEFS;
export type SystemSettingValueMap = {
    [K in SystemSettingName]: (typeof SYSTEM_SETTING_DEFS)[K]["default"];
};

export type SettingItemInput = {
    key: string;
    value: unknown;
};

export type SettingItem = {
    key: string;
    value: unknown;
};

export class SettingService extends Collection<Setting> {
    constructor() {
        super("settings");
        super.createIndex({ key: 1 }, { unique: true });
    }

    private ensureSettingName(name: string): SystemSettingName {
        if (!(name in SYSTEM_SETTING_DEFS)) {
            throw new Error(`Unknown setting key: ${name}`);
        }
        return name as SystemSettingName;
    }

    private ensureType(type: string, value: unknown, key: string) {
        if (type === "boolean" && typeof value !== "boolean") {
            throw new Error(`${key} must be a boolean`);
        }
        if (type === "number" && typeof value !== "number") {
            throw new Error(`${key} must be a number`);
        }
        if (type === "string" && typeof value !== "string") {
            throw new Error(`${key} must be a string`);
        }
    }

    async getValue<T>(key: string, defaultValue: T, type = "json") {
        const setting = await this.findOne({ key } as any);

        if (!setting) {
            await this.updateOne(
                { key } as any,
                {
                    $setOnInsert: {
                        key,
                        value: defaultValue,
                        type,
                        default: defaultValue,
                    } as Partial<Setting>,
                },
                { upsert: true },
            );
            return defaultValue;
        }

        if (setting.value === undefined) {
            return setting.default as T;
        }

        return setting.value as T;
    }

    async setValue<T>(key: string, value: T, type = "json", defaultValue?: T) {
        await this.updateOne(
            { key } as any,
            {
                $set: {
                    key,
                    value,
                    type,
                } as Partial<Setting>,
                $setOnInsert: {
                    ...(defaultValue === undefined ? {} : { default: defaultValue }),
                } as Partial<Setting>,
            },
            { upsert: true },
        );

        return await this.findOne({ key } as any);
    }

    async getByName<K extends SystemSettingName>(name: K): Promise<SystemSettingValueMap[K]> {
        const definition = SYSTEM_SETTING_DEFS[name];
        return await this.getValue<SystemSettingValueMap[K]>(
            definition.key,
            definition.default as SystemSettingValueMap[K],
            definition.type,
        );
    }

    async setByName<K extends SystemSettingName>(name: K, value: SystemSettingValueMap[K]) {
        const definition = SYSTEM_SETTING_DEFS[name];
        this.ensureType(definition.type, value, name);
        return await this.setValue<SystemSettingValueMap[K]>(
            definition.key,
            value,
            definition.type,
            definition.default as SystemSettingValueMap[K],
        );
    }

    async getItems(names?: string[]): Promise<SettingItem[]> {
        const targetNames = names?.length
            ? names.map((name) => this.ensureSettingName(name))
            : (Object.keys(SYSTEM_SETTING_DEFS) as SystemSettingName[]);

        const result: SettingItem[] = [];
        for (const name of targetNames) {
            const value = await this.getByName(name);
            result.push({ key: name, value });
        }
        return result;
    }

    async setItems(items: SettingItemInput[]): Promise<SettingItem[]> {
        for (const item of items) {
            const name = this.ensureSettingName(item.key);
            const definition = SYSTEM_SETTING_DEFS[name];
            this.ensureType(definition.type, item.value, name);
            await this.setValue(
                definition.key,
                item.value,
                definition.type,
                definition.default,
            );
        }

        const names = items.map((item) => item.key);
        return await this.getItems(names);
    }
}

export const Settings = new SettingService();
