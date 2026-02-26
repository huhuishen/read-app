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
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
        overflow: hidden;
    }

    .card-header {
        padding: 1rem 1.5rem;
        /* border-bottom: 1px solid #e5e7eb; */
        /* background-color: #f9fafb; */
    }

    .card-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
    }

    .card-body {
        padding: 1.5rem;
    }
</style>
