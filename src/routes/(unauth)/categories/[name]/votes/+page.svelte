<script lang="ts">
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
    <Stream items={data.items} />
</CategoryTabs>

<style>
</style>
