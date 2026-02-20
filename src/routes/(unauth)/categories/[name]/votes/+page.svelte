<script lang="ts">
    import CategoryTabs from "../CategoryTabs.svelte";
    import type { PageProps } from "./$types";
    import Stream from "./Stream.svelte";
    import VotePage from "./VotePage.svelte";

    const { data }: PageProps = $props();
</script>

<CategoryTabs name={data.params.name} active="votes">
    <!-- <VotePage items={data.items} /> -->
    <Stream items={data.items} />
</CategoryTabs>

<style>
</style>
