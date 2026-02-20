<script lang="ts">
    import Pagination from "$lib/components/Pagination.svelte";
    import type { Article } from "$lib/models";
    import type { ArticleUserState } from "$lib/models/articleStats";
    import type { DataPage } from "$lib/mongolite";
    import { toLocalDateString } from "$lib/util/client";
    import { formatCompletion, formatDurationWithUnit } from "../../../util";

    let {
        data,
    }: {
        data: {
            stats: DataPage<ArticleUserState>;
            articles: Article[];
        };
    } = $props();

    const articleMap = $derived(new Map(data.articles.map((s) => [s.id, s])));
</script>

<!-- <Debug variable={data}></Debug> -->

{#snippet card(item?: Article)}
    {#if item}
        <div class="flex column g-1 stats">
            <a class="flex row sb" href="/articles/{item.id}">
                <span class="title">{item.title}</span>
            </a>
            <div class="flex row g-3 gray">
                <span>{item.author}</span>
                <span>{toLocalDateString(item.createdAt)}</span>
            </div>
        </div>
    {:else}
        <div class="flex column g-1">
            <span class="gray">文章已被删除</span>
        </div>
    {/if}
{/snippet}

{#snippet durationStat(seconds: number)}
    {@const { value, unit } = formatDurationWithUnit(seconds)}

    <div class="value">
        {value}
        <small class="gray">{unit}</small>
    </div>
{/snippet}

{#if !data || data.stats.items.length === 0}
    <p class="empty">暂无已读</p>
{:else}
    <div class="flex column g-3">
        {#each data.stats.items as item}
            <div class="flex row sb card">
                {@render card(articleMap.get(item.articleId!)!)}
                <div class="flex row sb stats">
                    <div>
                        <div class="value">
                            {formatCompletion(item.completion)}
                            <small class="gray">%</small>
                        </div>
                        <div class="label">最大进度</div>
                    </div>
                    <div>
                        {@render durationStat(item.value)}
                        <div class="label">阅读时长</div>
                    </div>
                    <div>
                        <div class="value">
                            {toLocalDateString(item.updatedAt)}
                        </div>
                        <div class="label">上次阅读</div>
                    </div>
                </div>
            </div>
        {/each}
    </div>

    {#if data.stats.totalPages > 1}
        <div class="mt-3 mb-3">
            <Pagination
                total={data.stats.totalItems}
                limit={data.stats.limit}
                page={data.stats.page}
                formatUrl={(page) => {
                    return `?page=${page}`;
                }}
            ></Pagination>
        </div>
    {/if}
{/if}

<style>
    .empty {
        color: #aaa;
    }

    .title {
        font-size: 20px;
        font-weight: 600;
        color: var(--header-color);
        font-family: "Times New Roman", Times, serif;
        /* width: calc(max(50%, 360px)); */
    }

    .gray {
        color: #666;
        font-size: 16px;
    }

    .card {
        /* width: 100%; */
        /* max-width: 600px; */
        border-bottom: 1px solid #eee;
    }

    .stats {
        /* max-width: 425px; */
        width: calc(max(50%, 360px));
        padding: 0.75rem 0;
    }

    @media (max-width: 800px) {
        .stats {
            width: 100%;
        }
    }

    .value {
        font-size: 20px;
        text-align: center;
    }

    .label {
        color: #aaa;
        text-align: center;
    }
</style>
