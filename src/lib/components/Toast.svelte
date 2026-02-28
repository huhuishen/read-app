<script lang="ts">
    import { toast } from "../stores/toast.svelte.ts";
</script>

<div
    class="toast"
    class:show={toast.visible}
    class:info={toast.type === "info"}
    class:success={toast.type === "success"}
    class:warn={toast.type === "warn"}
    class:error={toast.type === "error"}
>
    {toast.message}
</div>

<style>
    .toast {
        position: fixed;
        top: 0;
        width: 100%;
        left: 0;
        right: 0;
        height: 30px;
        align-items: center;
        justify-content: center;
        display: none;
        z-index: 4000;
        /* 关键三件套 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .info {
        color: var(--status-info-text);
        background-color: var(--status-info-bg);
    }

    .success {
        color: var(--status-success-text);
        background-color: var(--status-success-bg);
    }

    .warn {
        color: var(--status-warning-text);
        background-color: var(--surface-soft);
    }

    .error {
        color: var(--status-danger-text);
        background-color: var(--status-danger-bg);
    }

    .show {
        display: flex;
    }
</style>
