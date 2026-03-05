<script lang="ts">
    import AdminTabs from "../AdminTabs.svelte";
    import TableTags from "./TableTags.svelte";

    const { data } = $props();
</script>

<svelte:head>
    <title>标签管理</title>
</svelte:head>

<AdminTabs active="tags">
    <TableTags {data} />
</AdminTabs>
