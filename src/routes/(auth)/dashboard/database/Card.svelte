<script lang="ts">
    export let title: string = "";
</script>

<div class="card">
    {#if title}
        <div class="card-header">
            <h3>{title}</h3>
        </div>
    {/if}
    <div class="card-body">
        <slot />
    </div>
</div>

<style>
    .card {
        background: white;
        /* border-radius: 8px;
        box-shadow: 0 2px 4px var(--shadow-sm); */
        overflow: hidden;
    }

    .card-header {
        padding: 1rem 1.5rem;
        /* border-bottom: 1px solid var(--border-soft); */
        /* background-color: var(--surface-modal); */
    }

    .card-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .card-body {
        padding: 1.5rem;
    }
</style>

