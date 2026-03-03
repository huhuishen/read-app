<script lang="ts">
    import ArticleNavbar from "../[id]/ArticleNavbar.svelte";
    import ArticleEditor from "../editor/ArticleEditor.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>Create Article</title>
</svelte:head>

<main>
    <ArticleNavbar user={data.user}></ArticleNavbar>
    <ArticleEditor mode="create" />
</main>

<style>
    main {
        background: var(--main-bg-color);
    }
</style>
