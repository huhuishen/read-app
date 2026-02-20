<script lang="ts">
    import { goto } from "$app/navigation";
    import Avatar from "$lib/components/Avatar.svelte";
    import Button from "$lib/components/Button.svelte";
    import { type Article } from "$lib/models";
    import type { Underline } from "$lib/models/underline";
    import { user } from "$lib/stores/session.svelte";
    import ReadingStats from "./ReadingStats.svelte";

    let {
        article,
        underlines,
    }: {
        article: Article;
        underlines: Underline[];
    } = $props();

    function numberS(n: number, dig: number = 0) {
        if (typeof n !== "number") {
            return 0;
        }
        const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: dig,
            maximumFractionDigits: dig,
        });

        return formatter.format(n);
    }

    function countText(text: string) {
        var c = text.length;
        return c > 1000
            ? { value: (c / 1000.0).toFixed(1), unit: "千字" }
            : { value: c, unit: "字" };
    }

    // svelte-ignore state_referenced_locally
    let { value, unit } = countText(article.content);

    export function pubDate(date: Date | undefined) {
        if (!date) return "";
        const d = new Date(date);
        const result = `${d.getFullYear()} 年 ${(d.getMonth() + 1).toString()} 月发表`;
        return result;
    }
</script>

<img
    class="cover"
    src={article.coverImage}
    data-original={article.coverImage}
    alt=""
/>
<div class="article-meta content">
    <div class="flex title">
        <div class="flex g-1">
            <h1>{article.title}</h1>
        </div>
    </div>

    <div class="flex sb">
        <a class="flex g-3" href="/profile/{article.authorId}/articles">
            <Avatar name={article.author}></Avatar>
            <span> {article.author}</span>
        </a>
        <h2 class="score">
            <span
                title={article.ratingCount > 0
                    ? `来自 ${article.ratingCount} 个用户的评分`
                    : "暂无评分"}
                >{article.rating ? article.rating.toFixed(1) : "-.-"}
                <small>/ 10</small></span
            >
        </h2>
    </div>

    <div class="flex stats">
        <ReadingStats
            title="阅读"
            value={article.viewCount}
            subtitle={`${article.bookmarkCount} 人关注`}
        />
        <ReadingStats
            title="评论"
            value={article.commentCount}
            subtitle={`${underlines.length} 划线评论`}
        />
        <ReadingStats
            title="字数"
            {value}
            {unit}
            subtitle={pubDate(article.createdAt)}
        />
    </div>

    {#if article.summary}
        <blockquote class="quote-elegant">
            {article.summary}
        </blockquote>
    {/if}

    <div class="flex tags">
        {#each article.categories as tag}
            <a class="tag" href="/categories/{tag}/1">{tag}</a>
        {/each}
    </div>

    <div class="start">
        <Button
            onclick={() => {
                goto(`/articles/${article.id}/write`);
            }}>编辑</Button
        >
        {#if article.status === "pending" && user?.name === "admin"}
            <Button
                onclick={() => {
                    goto(`/articles/${article.id}/review`);
                }}>审核</Button
            >
        {/if}
        <Button
            variant="primary"
            onclick={() => {
                goto(`/articles/${article.id}`);
            }}>开始阅读</Button
        >
    </div>
</div>

<style>
    .cover {
        z-index: 1000;
        width: 100%;
        max-width: 800px;
        user-select: none;
    }

    .quote-elegant {
        font-size: 20px;
        position: relative;
        padding: 1.5rem 0 1.5rem 0;
        margin: 2rem 0;
        /* background-color: rgba(200, 200, 200, 0.2); */
        font-style: italic;
        line-height: 2;
    }

    .quote-elegant::before {
        content: "“";
        position: absolute;
        left: 0;
        top: -50px;
        font-size: 4rem;
        color: #6c757d;
        font-family: Georgia, serif;
        opacity: 0.3;
    }

    .article-meta {
        color: var(--link-color);
        display: flex;
        flex-direction: column;
    }

    .title {
        position: relative;
        /* justify-content: space-between; */
        color: var(--header-color);
        /* margin: 20px auto; */
    }
    .title h1 {
        font-weight: 600;
        font-size: 32px;
        color: var(--header-color);
        font-family: "Times New Roman", Times, serif;
    }
    .score {
        color: brown;
        font-size: 26px;
    }
    small {
        font-size: 50%;
    }

    .tags {
        flex-wrap: wrap;
        gap: 8px;
        margin: 1rem 0;
    }
    .tag {
        /* color: brown; */
        /* border: 1px solid brown; */
        /* border: 1px solid var(--link-color); */
        border-radius: 5px;
        background-color: rgba(200, 200, 200, 0.2);
        color: var(--link-color);
        padding: 0.25rem;
        cursor: pointer;
    }
    .tag:hover {
        background-color: rgba(200, 200, 200, 0.4);
        color: var(--highlight-color);
    }
    .tag::before {
        content: "#";
        margin-right: 0.25rem;
    }
    .stats {
        margin: 1rem auto;
        padding-top: 4rem;
        /* display: flex; */
        gap: 40px;
    }
    @media (max-width: 567px) {
        .stats {
            gap: 5px;
        }
    }
    .start {
        margin: 10rem auto;
        display: flex;
        gap: 40px;
    }
</style>
