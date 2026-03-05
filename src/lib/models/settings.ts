import fs from "node:fs/promises";
import path from "node:path";
import { SimpleCache } from "$lib/util/cache";

const SYSTEM_SETTINGS_ID = "system";
const CONFIG_FILE_PATH = path.resolve(process.cwd(), "src/lib/config.js");
const SETTINGS_BLOCK_PATTERN = /export const systemSettings = \{[\s\S]*?\};?/m;
const AUTO_PUBLISH_PATTERN = /autoPublishWithoutReview\s*:\s*(true|false)/;

export type Settings = {
    id: string;
    autoPublishWithoutReview: boolean;
};

export class SettingsService {
    cache = new SimpleCache();

    private getDefaultSettings(): Settings {
        return {
            id: SYSTEM_SETTINGS_ID,
            autoPublishWithoutReview: false,
        };
    }

    private async readSystemSettingsFromConfig(): Promise<Settings> {
        const defaults = this.getDefaultSettings();
        const content = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
        const match = content.match(AUTO_PUBLISH_PATTERN);
        if (!match) return defaults;

        return {
            ...defaults,
            autoPublishWithoutReview: match[1] === "true",
        };
    }

    async getSystemSettings() {
        return this.cache.get(
            SYSTEM_SETTINGS_ID,
            async () => await this.readSystemSettingsFromConfig(),
        );
    }

    async setAutoPublishWithoutReview(value: boolean) {
        const content = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
        const targetValue = value ? "true" : "false";

        let nextContent: string;
        if (SETTINGS_BLOCK_PATTERN.test(content)) {
            nextContent = content.replace(SETTINGS_BLOCK_PATTERN, (block) => {
                if (AUTO_PUBLISH_PATTERN.test(block)) {
                    return block.replace(AUTO_PUBLISH_PATTERN, `autoPublishWithoutReview: ${targetValue}`);
                }

                const trimmed = block.replace(/\}\;?\s*$/, "");
                return `${trimmed}\n    autoPublishWithoutReview: ${targetValue},\n};`;
            });
        } else {
            nextContent =
                `${content.trimEnd()}\n\n` +
                `export const systemSettings = {\n` +
                `    autoPublishWithoutReview: ${targetValue},\n` +
                `};\n`;
        }

        await fs.writeFile(CONFIG_FILE_PATH, nextContent, "utf-8");

        this.cache.delete(SYSTEM_SETTINGS_ID);
        return await this.getSystemSettings();
    }
}

export const Settings = new SettingsService();
