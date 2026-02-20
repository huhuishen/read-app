<script lang="ts">
    import type { Article } from "$lib/models";

    const {
        article,
        number,
        size = "sm",
    }: {
        article: Partial<Article>;
        number?: number;
        size?: "sm" | "lg" | "xl";
    } = $props();

    function rating(a: Partial<Article>) {
        if (!a.ratingCount) return null;
        return (a.ratingSum! / a.ratingCount).toFixed(1);
    }
</script>

<div class="flex row sb card card-{size}">
    <div class="number">#{number}</div>
    <div class="cover">
        {#if article.coverImage}
            <img src={article.coverImage} alt={article.title ?? "封面图"} />
        {:else}
            <div class="placeholder"></div>
        {/if}
    </div>
    <div class="flex column g-1 title">
        <a class="flex row sb" href="/articles/{article.id}">
            <span class="">{article.title}</span>
        </a>
        <div class="flex row g-3 gray">
            <span>{article.author}</span>
        </div>
    </div>
    <div class="stats">
        <div class="value">
            {article.voteCount ?? 0}
        </div>
        <div class="label">投票</div>
    </div>
    <div class="stats">
        <div class="value">
            {(article.ratingSum! / article.ratingCount!).toFixed(1)}
        </div>
        <div class="label">评分</div>
    </div>
</div>

<style>
    .number {
        color: var(--text-color);
        font-size: 20px;
        font-weight: 500;
        padding: 0 10px;
        text-align: left;
        width: 50px;
    }
    .cover {
        width: 120px;
        height: 100px;
    }

    .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .title {
        font-size: 20px;
        font-weight: 600;
        color: var(--header-color);
        font-family: "Times New Roman", Times, serif;
        width: calc(max(60%, 280px));
    }

    .gray {
        color: #666;
        font-size: 16px;
    }

    .card {
        width: 100%;
    }
    .card-sm {
        height: 60px;
    }
    .card-lg {
        height: 180px;
    }
    .card-xl {
        height: 360px;
    }
    .stats {
        width: 50px;
    }

    @media (max-width: 800px) {
        .stats {
            /* width: 100%; */
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
