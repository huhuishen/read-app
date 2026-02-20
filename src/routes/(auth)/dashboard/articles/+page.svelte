<script lang="ts">
    import AdminTabs from "../AdminTabs.svelte";
    import ArticleTable from "../TableArticle.svelte";

    const { data } = $props();
</script>

<svelte:head>
    <title>作品管理</title>
</svelte:head>

<AdminTabs active="articles">
    <ArticleTable {data} />
</AdminTabs>
