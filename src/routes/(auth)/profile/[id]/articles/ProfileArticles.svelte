<script lang="ts">
    import Card from "$lib/components/article/Card.svelte";
    import Pagination from "$lib/components/Pagination.svelte";

    let { data } = $props();
</script>

{#if !data || data.items.length === 0}
    <p class="empty">暂无作品</p>
{:else}
    {#each data.items as article}
        <Card {article} />
    {/each}

    {#if data.totalPages > 1}
        <div class="mt-3 mb-3">
            <Pagination
                total={data.totalItems}
                limit={data.limit}
                page={data.page}
                formatUrl={(page) => {
                    return `?page=${page}`;
                }}
            ></Pagination>
        </div>
    {/if}
{/if}

<style>
    .empty {
        color: #aaa;
    }
</style>
