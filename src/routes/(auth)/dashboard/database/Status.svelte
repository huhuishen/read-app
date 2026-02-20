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
        background-color: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
    }

    .status-error {
        background-color: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
    }

    .status-info {
        background-color: #dbeafe;
        color: #1e40af;
        border: 1px solid #bfdbfe;
    }

    .status-warning {
        background-color: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
    }
</style>
