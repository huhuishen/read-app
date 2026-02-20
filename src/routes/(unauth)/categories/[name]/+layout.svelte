<script lang="ts">
    import CategorySidebar from "./CategorySidebar.svelte";

    const { data, children } = $props();
</script>

<svelte:head>
    <title>{data.params.name}</title>
</svelte:head>

<div class="container">
    {@render children?.()}
    <aside class="side flex column center g-3">
        <CategorySidebar {data}></CategorySidebar>
    </aside>
</div>

<style>
    .container {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
    }

    .layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 16px;
    }

    .main {
        min-width: 0;
    }

    .side {
        position: fixed;
        top: 30px;
        left: calc(50% + 410px);
        /* transform: translateX(100%); */
        height: fit-content;
        width: 300px;
        background-color: white;
        padding: 1rem;
    }

    @media (max-width: 1420px) {
        .container {
            padding: 0 5px;
        }
        .layout {
            grid-template-columns: 1fr;
        }

        .side {
            position: static;
            width: 100%;
            margin-top: 20px;
        }
    }
</style>
