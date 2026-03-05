<script lang="ts">
    import type { Category } from "$lib/models";
    import AdminTabs from "../AdminTabs.svelte";
    import TableCategories from "./TableCategories.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>期刊管理</title>
</svelte:head>

<AdminTabs active="categories">
    <TableCategories {data} />
</AdminTabs>
