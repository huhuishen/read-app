<script lang="ts">
    import Card from "$lib/components/article/Card.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import CategoryTabs from "../CategoryTabs.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
</script>

<CategoryTabs name={data.params.name} active="articles">
    <div class="flex column">
        {#each data.items as article, id}
            <Card
                {article}
                number={data.totalItems - data.limit * (data.page - 1) - id}
            />
        {/each}

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
</CategoryTabs>

<style>
</style>
