export interface BackupOptions {
    collections?: string[];
    backupName?: string;
    backupDir: string;
}

export interface BackupResult {
    success: boolean;
    message: string;
    backupFile?: string;
    collections?: string[];
    documentCount?: number;
    error?: string;
}

export interface RestoreOptions {
    backupFile: string;
    collections?: string[];
    dropExisting?: boolean;
}

export interface RestoreResult {
    success: boolean;
    message: string;
    restoredCollections?: string[];
    restoredCount?: number;
    error?: string;
}