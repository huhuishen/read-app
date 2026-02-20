<script lang="ts">
    import type { Article } from "$lib/models";

    const { items }: { items: Partial<Article>[] } = $props();

    function avgRating(article: Article) {
        if (!article.ratingCount) return null;
        return (article.ratingSum! / article.ratingCount).toFixed(1);
    }

    function medal(index: number) {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return null;
    }
</script>

<div class="ranking">
    <header class="header">
        <h1>作品排行榜</h1>
        <p>按投票数排序</p>
    </header>

    <!-- Top 3 -->
    <section class="top3">
        <!-- 第一名 -->
        {#if items[0]}
            <article class="top-card first rank-0">
                <div class="medal">🥇</div>

                <div class="cover large">
                    {#if items[0].coverImage}
                        <img
                            src={items[0].coverImage}
                            alt={items[0].title ?? "封面图"}
                        />
                    {:else}
                        <div class="placeholder"></div>
                    {/if}
                </div>

                <div class="info">
                    <h2>{items[0].title}</h2>

                    <div class="meta">
                        {items[0].author}
                    </div>

                    <div class="stats">
                        <span>👍 {items[0].voteCount ?? 0}</span>
                        <span>👁 {items[0].viewCount ?? 0}</span>
                        <span>💬 {items[0].commentCount ?? 0}</span>
                    </div>
                </div>
            </article>
        {/if}

        <!-- 第二三名 -->
        <div class="second-row">
            {#each items.slice(1, 3) as article, i}
                <article class="top-card rank-{i + 1}">
                    <div class="medal">
                        {i === 0 ? "🥈" : "🥉"}
                    </div>

                    <div class="cover">
                        {#if article.coverImage}
                            <img
                                src={article.coverImage}
                                alt={article.title ?? "封面图"}
                            />
                        {:else}
                            <div class="placeholder"></div>
                        {/if}
                    </div>

                    <div class="info">
                        <h2>{article.title}</h2>

                        <div class="meta">
                            {article.author}
                        </div>

                        <div class="stats">
                            <span>👍 {article.voteCount ?? 0}</span>
                            <span>👁 {article.viewCount ?? 0}</span>
                            <span>💬 {article.commentCount ?? 0}</span>
                        </div>
                    </div>
                </article>
            {/each}
        </div>
    </section>

    <!-- Others -->
    <section class="others">
        {#each items.slice(3) as article, i}
            <article class="list-item">
                <div class="rank">
                    #{i + 4}
                </div>

                <div class="cover small">
                    {#if article.coverImage}
                        <img
                            src={article.coverImage}
                            alt={article.title ?? "封面图"}
                        />
                    {:else}
                        <div class="placeholder"></div>
                    {/if}
                </div>

                <div class="info">
                    <div class="title">
                        {article.title}
                    </div>

                    <div class="meta">
                        {article.author}
                    </div>
                </div>

                <div class="stats">
                    <span>👍 {article.voteCount ?? 0}</span>
                    <span>👁 {article.viewCount ?? 0}</span>
                    <span>💬 {article.commentCount ?? 0}</span>
                </div>
            </article>
        {/each}
    </section>
</div>

<style>
    .ranking {
        max-width: 1000px;
        margin: auto;
        padding: 24px;
    }

    .header {
        text-align: center;
        margin-bottom: 30px;
    }

    .header h1 {
        font-size: 32px;
        margin: 0;
    }

    .header p {
        color: #888;
    }

    /* TOP 3 */

    .second-row {
        display: grid;

        grid-template-columns: 1fr 1fr;

        gap: 20px;
    }

    @media (max-width: 700px) {
        .second-row {
            grid-template-columns: 1fr;
        }
    }
    .top-card.first {
        transform: scale(1.05);
    }

    .cover.large {
        height: 240px;
    }

    .top-card.first h2 {
        font-size: 24px;
    }
    .top-card {
        position: relative;

        border-radius: 16px;

        overflow: hidden;

        background: linear-gradient(180deg, #ffffff, #f8f8f8);

        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        transition: 0.2s;
    }

    .top-card:hover {
        transform: translateY(-4px);
    }

    .rank-0 {
        background: linear-gradient(180deg, #fff7cc, #fff);
    }

    .rank-1 {
        background: linear-gradient(180deg, #eef3ff, #fff);
    }

    .rank-2 {
        background: linear-gradient(180deg, #ffeede, #fff);
    }

    .medal {
        position: absolute;

        top: 8px;
        left: 8px;

        font-size: 28px;
    }

    .cover {
        height: 160px;
        background: #eee;
    }

    .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #eee, #ddd);
    }

    .info {
        padding: 16px;
    }

    .info h2 {
        margin: 0 0 6px;
        font-size: 18px;
    }

    .meta {
        color: #777;
        font-size: 14px;
        margin-bottom: 8px;
    }

    .stats {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: #555;
    }

    /* Others */

    .others {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .list-item {
        display: flex;
        align-items: center;

        gap: 12px;

        padding: 12px;

        border-radius: 12px;

        background: white;

        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        transition: 0.15s;
    }

    .list-item:hover {
        transform: translateX(4px);
    }

    .rank {
        font-weight: bold;
        width: 32px;
    }

    .cover.small {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        overflow: hidden;
    }

    .info {
        flex: 1;
    }

    .title {
        font-weight: 600;
    }

    .meta {
        font-size: 13px;
        color: #777;
    }

    .stats {
        display: flex;
        gap: 10px;
        font-size: 13px;
        color: #666;
    }
</style>
