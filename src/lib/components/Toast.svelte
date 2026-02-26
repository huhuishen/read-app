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
        color: #052c65;
        background-color: #cfe2ff;
    }

    .success {
        color: #0a3622;
        background-color: #d1e7dd;
    }

    .warn {
        color: #664d03;
        background-color: #fff3cd;
    }

    .error {
        color: #58153b;
        background-color: #f8d7da;
    }

    .show {
        display: flex;
    }
</style>
