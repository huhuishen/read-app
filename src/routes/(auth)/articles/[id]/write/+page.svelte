<script lang="ts">
    import type { PageProps } from "./$types";
    import ArticleEditor from "../../editor/ArticleEditor.svelte";

    const { data }: PageProps = $props();
</script>

<svelte:head>
    <title>{data.article.title} - Edit</title>
</svelte:head>

<ArticleEditor mode="edit" initialArticle={data.article} />
