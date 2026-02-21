<script lang="ts">
    import { goto } from "$app/navigation";
    import Card from "$lib/components/article/Card.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import Search from "$lib/components/Search.svelte";
    import Menu from "$lib/components/user/Menu.svelte";
    import type { PageProps } from "./$types";
    import ArticleCard from "./ArticleCard.svelte";
    import Category from "./CategoryTitle.svelte";

    const { data }: PageProps = $props();
    // console.log(data);

    let user = $derived(data.user);
    let searchQuery = $derived(data.query || "");
    // const api = createApi();
</script>

<svelte:head>
    <title>零重力阅读</title>
</svelte:head>

<div class="flex top">
    <div class="searchbar">
        <Search
            bind:search={searchQuery}
            onSearch={(q) => {
                if (q.trim() === "") {
                    goto(`/`);
                    return;
                }
                goto(`/?q=${encodeURIComponent(q)}`);
            }}
        ></Search>
    </div>
    <div class="flex">
        {#if user}
            <Menu {user} />
        {:else}
            <a class="link" href="/login">登录</a>
            <span class="seperator"></span>
            <a class="link" href="/register">注册</a>
        {/if}
    </div>
</div>

<div class="main">
    <!-- <Debug variable={data}></Debug> -->

    {#if data.query}
        {#if data.searchResults.totalItems > 0}
            <div class="flex content center">
                {#each data.searchResults.items as article}
                    <Card {article}></Card>
                {/each}
            </div>
            <div class="mt-3 mb-3">
                <Pagination
                    total={data.searchResults.totalItems}
                    limit={data.searchResults.limit}
                    page={data.searchResults.page}
                ></Pagination>
            </div>
        {:else}
            <p class="empty">没有找到相关文章</p>
        {/if}
    {:else}
        <div class="flex">
            {#each data.categories as category}
                {#if category.level == 2}
                    <Category name={category.name} laurel={true} />

                    <div class="flex articles">
                        {#each category.previewArticles as article}
                            <ArticleCard {article}></ArticleCard>
                        {/each}
                    </div>
                {:else if category.level == 1}{:else}
                    <Category name="其它标签" laurel={false} />
                    <div class="flex g-2">
                        <a
                            class="category-title"
                            href="/categories/{encodeURI(category.name!)}/articles"
                        >
                            <div class="flex card-small">
                                <span> {category.name}</span>
                                <span>{category.articleCount}</span>
                            </div>
                        </a>
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>

<div class="flex footer">
    <a href="/about">简介</a>
    <span>&copy2025</span>
</div>

<style>
    .main {
        max-width: 1630px;
        min-height: calc(100vh - 200px);
        padding: 10px;
        margin: 0 auto;
    }

    .empty {
        text-align: center;
        padding: 60px;
        color: #999;
    }

    .top {
        justify-content: space-between;
        height: 100px;
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        user-select: none;
    }

    .footer {
        height: 100px;
        justify-content: center;
        color: #777;
        gap: 10px;
        font-size: 90%;
    }

    .searchbar {
        /* justify-content: center; */
        /* width: 20rem; */
        max-width: 80%;
        margin: 0 auto;
    }

    .articles {
        /* justify-content: start;
        gap: 10px;
        width: 100%; */
        display: grid;
        grid-template-columns: repeat(4, minmax(300px, 1fr));
        /* grid-template-columns: repeat(4, 1fr); */
        gap: 10px;
        width: 100%;
    }
    @media (max-width: 1500px) {
        .articles {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 900px) {
        .articles {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 600px) {
        .articles {
            grid-template-columns: 1fr;
        }
    }

    .card-small {
        justify-content: space-between;
        min-width: 150px;
        height: 100px;
        background: var(--reader-bg-color);
        color: var(--text-color);
        padding: 1rem;
        cursor: pointer;
    }
    .card-small:hover {
        background-color: rgba(141, 219, 255, 0.2);
    }
    .category-title {
        text-decoration: none;
        color: var(--header-color);
        font-size: 18px;
        font-weight: bold;
    }
</style>
