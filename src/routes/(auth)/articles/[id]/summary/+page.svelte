<script lang="ts">
    import type { PageProps } from "./$types";
    import ArticleSummary from "./ArticleSummary.svelte";

    const { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    const article = $state(data.article);
</script>

<svelte:head>
    <title>{article.title} - 作品概况</title>
</svelte:head>

<ArticleSummary {article} underlines={data.underlines}></ArticleSummary>

<style>
</style>
