<script lang="ts">
    import type { PageProps } from "./$types";
    import ArticleEditor from "../../editor/ArticleEditor.svelte";

    const { data }: PageProps = $props();
</script>

<svelte:head>
    <title>{data.article.title} - 审核编辑</title>
</svelte:head>

<ArticleEditor mode="review" initialArticle={data.article} />
