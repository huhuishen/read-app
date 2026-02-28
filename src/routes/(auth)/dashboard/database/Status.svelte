<script lang="ts">
    export let type: "success" | "error" | "info" | "warning" = "info";
    export let message: string = "";
</script>

<div class="status status-{type}">
    {#if type === "success"}
        ✓
    {:else if type === "error"}
        ✗
    {:else if type === "warning"}
        ⚠
    {:else}
        ℹ
    {/if}
    <span>{message}</span>
</div>

<style>
    .status {
        padding: 0.75rem 1rem;
        border-radius: 4px;
        margin: 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
    }

    .status-success {
        background-color: var(--status-success-bg);
        color: var(--status-success-text);
        border: 1px solid var(--status-success-border);
    }

    .status-error {
        background-color: var(--status-danger-bg);
        color: var(--status-danger-text);
        border: 1px solid var(--status-danger-border);
    }

    .status-info {
        background-color: var(--status-info-bg);
        color: var(--status-info-text);
        border: 1px solid var(--status-info-border);
    }

    .status-warning {
        background-color: var(--status-warning-bg);
        color: var(--status-warning-text);
        border: 1px solid var(--status-warning-border);
    }
</style>
