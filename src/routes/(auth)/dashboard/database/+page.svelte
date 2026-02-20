<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Card from "./Card.svelte";
    import Status from "./Status.svelte";
    import { onMount } from "svelte";

    // 页面数据
    let { data } = $props();

    // 状态管理
    // svelte-ignore state_referenced_locally
    let backups = $state(data.backups || []);
    let selectedCollections = $state<string[]>([]);
    let availableCollections = $state<string[]>([]);
    let selectedBackup = $state<string>("");
    let backupName = $state<string>("");
    let isLoading = $state(false);
    let message = $state<{
        type: "success" | "error" | "info";
        text: string;
    } | null>(null);
    let dropExisting = $state(false);

    // 获取可用集合
    async function fetchCollections() {
        try {
            const response = await fetch("/api/backup/list");
            const result = await response.json();

            if (result.success && result.backups.length > 0) {
                // 从最新备份中获取集合列表
                const latestBackup = result.backups[0];
                availableCollections = latestBackup.collections || [];
            }
        } catch (error) {
            console.error("Failed to fetch collections:", error);
        }
    }

    // 刷新备份列表
    async function refreshBackups() {
        try {
            const response = await fetch("/api/backup/list");
            const result = await response.json();

            if (result.success) {
                backups = result.backups;
            }
        } catch (error) {
            console.error("Failed to refresh backups:", error);
        }
    }

    // 执行备份
    async function performBackup() {
        if (isLoading) return;

        isLoading = true;
        message = null;

        try {
            const response = await fetch("/api/backup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    collections:
                        selectedCollections.length > 0
                            ? selectedCollections
                            : undefined,
                    backupName: backupName || undefined,
                }),
            });

            const result = await response.json();

            if (result.success) {
                message = {
                    type: "success",
                    text: `Backup created: ${result.backupFile} (${result.documentCount} documents)`,
                };
                backupName = "";
                selectedCollections = [];
                await refreshBackups();
            } else {
                message = {
                    type: "error",
                    text: `Backup failed: ${result.message}`,
                };
            }
        } catch (error) {
            message = {
                type: "error",
                text: "Failed to create backup",
            };
        } finally {
            isLoading = false;
        }
    }

    // 执行恢复
    async function performRestore() {
        if (isLoading || !selectedBackup) return;

        isLoading = true;
        message = null;

        try {
            const response = await fetch("/api/restore", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    backupFile: selectedBackup,
                    collections:
                        selectedCollections.length > 0
                            ? selectedCollections
                            : undefined,
                    dropExisting,
                }),
            });

            const result = await response.json();

            if (result.success) {
                message = {
                    type: "success",
                    text: `Restore completed: ${result.restoredCount} documents restored`,
                };
                selectedCollections = [];
            } else {
                message = {
                    type: "error",
                    text: `Restore failed: ${result.message}`,
                };
            }
        } catch (error) {
            message = {
                type: "error",
                text: "Failed to restore backup",
            };
        } finally {
            isLoading = false;
        }
    }

    // 初始化
    onMount(async () => {
        await fetchCollections();
    });
</script>

<svelte:head>
    <title>管理 | 数据库</title>
</svelte:head>


<Card title="MongoDB Backup & Restore">
    {#if message}
        <Status type={message.type} message={message.text} />
    {/if}

    <div class="app-info">
        <h2>Database:</h2>
        <p>MongoDB URI:</p>
    </div>

    <div class="grid">
        <!-- 备份面板 -->
        <Card title="Create Backup">
            <div class="form-group">
                <label for="backupName">Backup Name (optional)</label>
                <input
                    id="backupName"
                    type="text"
                    placeholder="Enter backup name"
                    bind:value={backupName}
                    class="input"
                />
            </div>

            <div class="form-group">
                <label for="collections-list"
                    >Select Collections (leave empty for all)</label
                >
                <div class="collections-list" id="collections-list">
                    {#each availableCollections as collection}
                        <label class="checkbox">
                            <input
                                type="checkbox"
                                value={collection}
                                bind:group={selectedCollections}
                            />
                            <span>{collection}</span>
                        </label>
                    {/each}
                </div>
            </div>

            <Button onclick={performBackup} disabled={isLoading}>
                Create Backup
            </Button>
        </Card>

        <!-- 恢复面板 -->
        <Card title="Restore from Backup">
            <div class="form-group">
                <label for="backupSelect">Select Backup</label>
                <select
                    id="backupSelect"
                    bind:value={selectedBackup}
                    class="select"
                >
                    <option value="">Choose a backup...</option>
                    {#each backups as backup}
                        <option value={backup.fileName}>
                            {backup.fileName} ({backup.metadata?.timestamp
                                ? new Date(
                                      backup.metadata.timestamp,
                                  ).toLocaleString()
                                : "Unknown date"})
                        </option>
                    {/each}
                </select>
            </div>

            {#if selectedBackup}
                {#each backups.filter((b: { fileName: string }) => b.fileName === selectedBackup) as backup}
                    <div class="backup-info">
                        <p>
                            <strong>Database:</strong>
                            {backup.metadata?.database || "Unknown"}
                        </p>
                        <p>
                            <strong>Collections:</strong>
                            {backup.collections?.join(", ") || "None"}
                        </p>
                        <p>
                            <strong>Total Documents:</strong>
                            {(
                                Object.values(backup.documentCounts) as number[]
                            ).reduce((a, b) => a + b, 0)}
                        </p>
                    </div>
                {/each}
            {/if}

            <div class="form-group">
                <label for="restoreCollections"
                    >Select Collections to Restore (leave empty for all)</label
                >
                <div class="collections-list">
                    {#if selectedBackup}
                        {#each backups.find((b: { fileName: string }) => b.fileName === selectedBackup)?.collections || [] as collection}
                            <label class="checkbox">
                                <input
                                    type="checkbox"
                                    value={collection}
                                    bind:group={selectedCollections}
                                />
                                <span>{collection}</span>
                            </label>
                        {/each}
                    {:else}
                        <p class="hint">
                            Select a backup first to see collections
                        </p>
                    {/if}
                </div>
            </div>

            <div class="form-group">
                <label class="checkbox">
                    <input type="checkbox" bind:checked={dropExisting} />
                    <span>Drop existing data before restore</span>
                </label>
            </div>

            <Button
                onclick={performRestore}
                disabled={isLoading || !selectedBackup}
            >
                Restore Backup
            </Button>
        </Card>
    </div>

    <!-- 备份列表 -->
    <Card title="Available Backups">
        <Button onclick={refreshBackups}>Refresh List</Button>

        <div class="backup-list">
            {#if backups.length === 0}
                <p class="empty">No backups found</p>
            {:else}
                <table>
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Date</th>
                            <th>Database</th>
                            <th>Collections</th>
                            <th>Documents</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each backups as backup}
                            <tr>
                                <td>{backup.fileName}</td>
                                <td
                                    >{backup.metadata?.timestamp
                                        ? new Date(
                                              backup.metadata.timestamp,
                                          ).toLocaleString()
                                        : "Unknown"}</td
                                >
                                <td>{backup.metadata?.database || "Unknown"}</td
                                >
                                <td>{backup.collections?.length || 0}</td>
                                <td
                                    >{(
                                        Object.values(
                                            backup.documentCounts,
                                        ) as number[]
                                    ).reduce((a, b) => a + b, 0)}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    </Card>
</Card>

<style>
    .app-info {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 2rem;
    }

    .app-info h2 {
        margin: 0 0 0.5rem 0;
        color: #1e293b;
    }

    .app-info p {
        margin: 0;
        color: #64748b;
        font-family: monospace;
        font-size: 0.875rem;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
        font-size: 0.875rem;
    }

    .input,
    .select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 0.875rem;
        transition: border-color 0.2s;
    }

    .input:focus,
    .select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .collections-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 0.5rem;
        background: #f9fafb;
    }

    .checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0;
        cursor: pointer;
        font-size: 0.875rem;
    }

    .checkbox input[type="checkbox"] {
        margin: 0;
    }

    .backup-info {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 4px;
        padding: 0.75rem;
        margin: 1rem 0;
        font-size: 0.875rem;
    }

    .backup-info p {
        margin: 0.25rem 0;
    }

    .hint {
        color: #6b7280;
        font-style: italic;
        font-size: 0.875rem;
        margin: 0.5rem 0;
    }

    .backup-list {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
    }

    thead {
        background-color: #f9fafb;
    }

    th {
        text-align: left;
        padding: 0.75rem 1rem;
        font-weight: 600;
        color: #374151;
        border-bottom: 2px solid #e5e7eb;
    }

    td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e5e7eb;
        color: #4b5563;
    }

    tr:hover {
        background-color: #f9fafb;
    }

    .empty {
        text-align: center;
        color: #6b7280;
        font-style: italic;
        padding: 2rem;
    }
</style>
