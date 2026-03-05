<script lang="ts">
    import AdminTabs from "../AdminTabs.svelte";
    import TableTags from "./TableTags.svelte";

    const { data } = $props();
</script>

<svelte:head>
    <title>±Í«©π‹¿Ì</title>
</svelte:head>

<AdminTabs active="tags">
    <TableTags {data} />
</AdminTabs>
