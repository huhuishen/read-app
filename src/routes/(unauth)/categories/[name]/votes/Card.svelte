<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import type { Article } from "$lib/models";

    const {
        article,
        number,
        size = "sm",
        onVoteClick,
    }: {
        article: Partial<Article>;
        number?: number;
        size?: "sm" | "lg" | "xl";
        onVoteClick?: (article: Partial<Article>) => void;
    } = $props();
</script>

<div class="card card-{size}">
    {#if article.coverImage}
        <img
            class="bg"
            src={article.coverImage}
            alt={article.title ?? "封面"}
        />
    {:else}
        <div class="bg placeholder"></div>
    {/if}

    <div class="flex row content">
        {#if number}
            <div class="number">#{number}</div>
        {:else}
            <div class="number"></div>
        {/if}

        <div class="book">
            <a class="title" href="/articles/{article.id}/summary">
                {article.title}
            </a>

            <a class="flex g-3" href="/profile/{article.authorId}/articles">
                {article.author}
                <span>
                    <Icon
                        name="star"
                        size={13}
                        fill="var(--warning)"
                        color="var(--warning)"
                    ></Icon>
                    {article.stats?.rateCount
                        ? (
                              article.stats.rateSum / article.stats.rateCount
                          ).toFixed(1)
                        : "-.-"}
                </span>
            </a>
        </div>

        <Button
            variant="danger"
            onclick={() => {
                onVoteClick?.(article);
            }}
        >
            <div class="stats">
                <div class="value">{article.stats?.vote ?? 0}</div>
                <div class="label">投票</div>
            </div>
        </Button>
    </div>
</div>

<style>
    .number {
        color: var(--text-color);
        padding: 0 10px;
        text-align: left;
        width: 50px;
        font-size: 20px;
        font-weight: bold;
    }

    .cover {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    .card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
            -45deg,
            var(--accent-soft),
            var(--surface-ghost)
        );
        pointer-events: none;
        z-index: 1;
    }

    .placeholder {
        width: 100%;
        height: 100%;
    }

    .title {
        font-size: 20px;
        font-weight: 600;
        color: var(--header-color);
        font-family: "Times New Roman", Times, serif;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .gray {
        color: var(--text-secondary);
        font-size: 16px;
    }

    .card {
        position: relative;
        overflow: hidden;
        display: flex;
        width: 100%;
    }

    .card-sm {
        height: 80px;
    }

    .card-lg {
        height: 180px;
    }

    .card-xl {
        height: 360px;
    }

    .card-lg .title {
        height: 48px;
        font-size: 28px;
        line-height: 24px;
    }

    .card-lg .number {
        font-size: 28px;
    }

    .card-xl .title {
        height: 64px;
        font-size: 32px;
        line-height: 32px;
    }

    .card-xl .number {
        font-size: 32px;
    }

    .stats {
        width: 50px;
    }

    .vote-trigger {
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        color: inherit;
        border-radius: 8px;
    }

    .vote-trigger:hover {
        background: var(--overlay-soft);
    }

    .value {
        font-size: 20px;
        text-align: center;
    }

    .label {
        text-align: center;
    }

    .bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
    }

    .content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        padding: 4px 16px;
    }

    @media (max-width: 425px) {
        .content {
            padding: 0;
        }
    }

    .book {
        display: flex;
        flex-direction: column;
        width: 60%;
    }
</style>
