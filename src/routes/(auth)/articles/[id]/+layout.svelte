<script lang="ts">
    import ArticleNavbar from "./ArticleNavbar.svelte";

    let { data, children } = $props();
</script>

<main>
    <ArticleNavbar user={data.user}></ArticleNavbar>
    {@render children()}
</main>

<style>
    main {
        background: var(--reader-bg-color);
    }
</style>
