<script lang="ts">
    import { goto } from "$app/navigation";

    const { data } = $props();

    goto(`/dashboard/articles`);
</script>

<svelte:head>
    <title>管理</title>
</svelte:head>
