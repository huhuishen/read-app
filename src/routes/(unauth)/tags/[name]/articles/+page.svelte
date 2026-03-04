<script lang="ts">
    import Card from "$lib/components/article/Card.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
</script>

<svelte:head>
    <title>{data.params.name} - 标签文章</title>
</svelte:head>

<div class="flex column mt-3">
    {#if data.totalItems > 0}
        {#each data.items as article, id}
            <Card
                {article}
                number={data.totalItems - data.limit * (data.page - 1) - id}
            />
        {/each}
    {:else}
        <p class="empty">该标签下暂无文章</p>
    {/if}

    {#if data.totalPages > 1}
        <div class="mt-3 mb-3">
            <Pagination
                total={data.totalItems}
                limit={data.limit}
                page={data.page}
                formatUrl={(page) => `?page=${page}`}
            ></Pagination>
        </div>
    {/if}
</div>

<style>

</style>
