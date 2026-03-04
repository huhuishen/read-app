<script lang="ts">
    import { toLocalDateString } from "$lib/util/client";
    import CategoryTabs from "../CategoryTabs.svelte";
    import type { PageProps } from "./$types";
    import Stream from "./Stream.svelte";

    const { data }: PageProps = $props();
</script>

<CategoryTabs name={data.params.name}  active="votes">
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
