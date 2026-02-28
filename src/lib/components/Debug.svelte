<script lang="ts">
    let { variable } = $props();
</script>

<div class="debug">
    typeof variable: {typeof variable}
    {JSON.stringify(variable, null, 2)}
</div>

<style>
    .debug {
        position: fixed;
        bottom: 0px;
        left: 0px;
        padding: 1rem;
        /* color: var(--text-secondary); */
        background-color: var(--surface-soft);
        white-space: pre-wrap; /* 保留空格和换行 */
        user-select: none;
        font-size: 0.75rem;
        max-width: 50%;
        max-height: 25%;
        line-height: 1.2rem;
        z-index: 5000;
        overflow-y: auto;
    }
</style>
