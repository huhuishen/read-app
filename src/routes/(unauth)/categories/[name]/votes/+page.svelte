<script lang="ts">
    import { toLocalDateString } from "$lib/util/client";
    import CategoryTabs from "../CategoryTabs.svelte";
    import type { PageProps } from "./$types";
    import VotePage from "./VotePage.svelte";

    const { data }: PageProps = $props();
</script>

<CategoryTabs name={data.category?.alias ?? data.category?.name ?? data.params.name} active="votes">
    {#if data.items === null}
        <p class="empty">
            投票结果将于 {toLocalDateString(data.category.voteEnd)} 显示
        </p>
    {:else}
        <VotePage items={data.items} />
    {/if}
</CategoryTabs>

<style>
</style>
