<script lang="ts">
    import type { Article } from "$lib/models";
    import { toLocalDateString } from "$lib/util/client";
    import type { Snippet } from "svelte";

    let {
        article,
        number,
        children,
    }: { article: Partial<Article>; number?: number; children?: Snippet } =
        $props();

    // console.log(article);
</script>

<a
    class="book-card"
    href="/articles/{article.id}/summary"
    aria-label={article.title}
>
    <div class="flex">
        {#if number}
            <div class="number">{number}</div>
        {/if}
        {#if article.coverImage && article.coverImage.trim() !== ""}
            <img
                src={article.coverImage}
                alt={article.title}
                class=" book-card-image"
            />
        {:else}
            <div class="flex book-card-image">无封面</div>
        {/if}

        <div class="flex book-details">
            <div class="flex row sb">
                <span class="title">{article.title}</span>
                {#if article.status != "published"}
                    <span class="tag">{article.status}</span>
                {/if}
            </div>
            <div class="flex book-meta">
                <span>{article.author}</span>
                <span>{toLocalDateString(article.createdAt)}</span>
            </div>
            <div class="summary">
                {article.summary || "暂无描述"}
            </div>
        </div>
        {@render children?.()}
    </div>
</a>

<style>
    .book-card {
        width: 100%;
        max-width: 960px;
        min-width: 320px;
        /* margin: 10px; */
        /* padding: 0 15px; */
        height: 180px;
        align-items: center;
        cursor: pointer;
        /* min-width: 425px; */
        /* background-color: #fff; */
    }

    .book-card:hover {
        background-color: rgba(141, 219, 255, 0.2);
    }

    .book-card-image {
        height: 150px;
        width: 200px;
        object-fit: cover;
        object-position: center;
        justify-content: center;
        flex-shrink: 0;
        background: var(--bg-color);
        color: var(--link-color);
        cursor: pointer;
    }

    .book-details {
        height: 180px;
        flex: 1;
        gap: 0.5rem;
        padding: 1rem;
        flex-direction: column;
        align-items: start;
        cursor: pointer;
    }

    .title {
        /* width: 100%; */
        font-size: 20px;
        font-weight: 600;
        color: var(--header-color);
        font-family: "Times New Roman", Times, serif;
    }

    .book-meta {
        color: #aaa;
        flex-wrap: nowrap;
        white-space: nowrap;
        gap: 15px;
        margin-bottom: 10px;
        cursor: pointer;
    }

    .summary {
        line-height: 22px;
        color: #aaa;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 3;
        -webkit-line-clamp: 3; /* 限制行数 */
        -webkit-box-orient: vertical;
    }

    .tag {
        color: #b19046;
        padding: 4px 8px;
        border: 1px solid #b19046;
    }

    .number {
        color: var(--text-color);
        font-size: 20px;
        font-weight: 500;
        padding: 0 15px;
        text-align: left;
        width: 4rem;
    }

    @media (max-width: 768px) {
        /* .article_list {
            width: calc(100% - 60px);
        } */
        .book-details {
            padding: 0px;
        }
        .book-card {
            /* padding: 1rem; */
        }
        .book-card-image {
            /* height: 150px;
            width: 100px; */
            display: none;
        }
    }
</style>
