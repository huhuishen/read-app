<script lang="ts">
    import { toLocalDateString } from "$lib/util/client";
    import CategoryTabs from "../CategoryTabs.svelte";
    import { getTabs } from "../tabDef";
    import type { PageProps } from "./$types";
    import Stream from "./Stream.svelte";
    import VotePage from "./VotePage.svelte";

    const { data }: PageProps = $props();
    let tabs = $derived(getTabs(data.category.award));
</script>

<CategoryTabs name={data.params.name} {tabs} active="votes">
    <!-- <VotePage items={data.items} /> -->

    {#if data.items === null}
        <p class="empty">
            投票结果将于 {toLocalDateString(data.category.voteEnd)} 显示
        </p>
    {:else}
        <Stream items={data.items} />
    {/if}
</CategoryTabs>

<style>
</style>
