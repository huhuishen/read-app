<script lang="ts">
    import { goto } from "$app/navigation";
    import Card from "$lib/components/article/Card.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import Search from "$lib/components/Search.svelte";
    import Menu from "$lib/components/user/Menu.svelte";
    import { onMount } from "svelte";
    import { getTheme, toggleTheme } from "../util";
    import type { PageProps } from "./$types";
    import ArticleCard from "./ArticleCard.svelte";
    import CategoryTitle from "./CategoryTitle.svelte";

    const { data }: PageProps = $props();
    // console.log(data);

    let user = $derived(data.user);
    let searchQuery = $derived(data.query || "");
    let theme = $state("light");
    // const api = createApi();

    let categories = $derived(data.categories ?? []);
    let tags = $derived(data.tags ?? []);

    onMount(() => {
        theme = getTheme() ?? "light";
    });
</script>

<svelte:head>
    <title>零重力阅</title>
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
    <div class="flex g-3">
        <Icon
            name={theme === "dark" ? "sun" : "moon"}
            onclick={() => {
                theme = toggleTheme();
            }}
        ></Icon>
        {#if user}
            <Menu {user} />
        {:else}
            <div class="flex">
                <a class="link" href="/login">登录</a>
                <div class="seperator"></div>
                <a class="link" href="/register">注册</a>
            </div>
        {/if}
    </div>
</div>

<div class="main">
    <!-- <Debug variable={data}></Debug> -->

    {#if data.query}
        {#if data.searchResults.totalItems > 0}
            <div class="flex content center g-3">
                {#each data.searchResults.items as article, id}
                    <Card
                        {article}
                        number={data.searchResults.limit *
                            (data.searchResults.page - 1) +
                            id +
                            1}
                    />
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
            {#each categories as category, i}
                <CategoryTitle
                    name={category.alias ?? category.name}
                    slug={category.alias ?? category.name}
                    more={true}
                />

                <div class="flex articles">
                    {#each category.previewArticles as article}
                        <ArticleCard {article} showCover={i < 1}></ArticleCard>
                    {/each}
                </div>
            {/each}

            <CategoryTitle name="其它标签" laurel={false} more={false} />
            <div class="flex g-2 categories">
                {#each tags as tag}
                    <a class="category-title" href="/tags/{tag.name}/articles">
                        <div class="flex card-small">
                            <span class="card-small-title">{tag.name}</span>
                            <span class="card-small-count"
                                >{tag.articleCount ?? 0}</span
                            >
                        </div>
                    </a>
                {/each}
            </div>
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
        color: var(--link-disabled);
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
        height: 300px;
        justify-content: center;
        color: var(--link-color);
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
        display: grid;
        grid-template-columns: repeat(4, minmax(300px, 1fr));
        gap: 10px;
        width: 100%;
    }
    .categories {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 10px;
        width: 100%;
    }
    .card-small {
        justify-content: column;
        height: 100px;
        background: var(--main-bg-color);
        color: var(--text-color);
        padding: 1rem;
        cursor: pointer;
    }
    .card-small:hover {
        background-color: var(--accent-soft);
    }
    .category-title {
        text-decoration: none;
        color: var(--header-color);
        font-size: 18px;
        /* font-weight: bold; */
    }
    .card-small-title {
        width: 100%;
        color: var(--text-secondary);
    }
    .card-small-count {
        width: 100%;
        color: var(--text-faint);
    }
    @media (max-width: 1229px) {
        .articles {
            grid-template-columns: repeat(3, minmax(300px, 1fr));
        }
        .categories {
            grid-template-columns: repeat(6, minmax(0, 1fr));
        }
    }

    @media (max-width: 919px) {
        .articles {
            grid-template-columns: repeat(2, minmax(300px, 1fr));
        }
        .categories {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    }

    @media (max-width: 609px) {
        .articles {
            grid-template-columns: minmax(300px, 1fr);
        }
        .categories {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
</style>
