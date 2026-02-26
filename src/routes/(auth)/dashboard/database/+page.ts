import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    try {
        const response = await fetch('/api/backup/list');
        const data = await response.json();

        return {
            backups: data.success ? data.backups : []
        };
    } catch (error) {
        console.error('Failed to load backups:', error);
        return {
            backups: []
        };
    }
};