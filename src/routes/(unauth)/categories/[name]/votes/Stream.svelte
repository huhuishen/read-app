<script lang="ts">
    type Article = {
        id: string;
        title: string;
        author: string;
        coverImage?: string;
        voteCount?: number;
        viewCount?: number;
        commentCount?: number;
        ratingCount?: number;
        ratingSum?: number;
        categories?: string[];
    };

    const { items }: { items: Partial<Article>[] } = $props();

    let ranked = $state<Partial<Article>[]>([]);

    $effect(() => {
        ranked = [...(items ?? [])].sort(
            (a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0),
        );
    });

    const champion = $derived(ranked[0]);
    const runnerUps = $derived(ranked.slice(1, 3));
    const others = $derived(ranked.slice(3));

    function rating(a: Partial<Article>) {
        if (!a.ratingCount) return null;
        return (a.ratingSum! / a.ratingCount).toFixed(1);
    }
</script>

<div class="flex center ranking">
    <!-- 冠军 -->
    {#if champion}
        <section class="champion">
            <div class="bg">
                {#if champion.coverImage}
                    <img src={champion.coverImage} alt="" />
                {:else}
                    <div class="placeholder"></div>
                {/if}
            </div>

            <div class="overlay">
                <div class="rank">#1</div>

                <h1>
                    {champion.title}
                </h1>

                <div class="meta">
                    <span>{champion.author}</span>

                    {#if rating(champion)}
                        <span>⭐ {rating(champion)}</span>
                    {/if}
                </div>

                <div class="stats">
                    <div>
                        <strong>{champion.voteCount ?? 0}</strong>
                        <span>投票</span>
                    </div>

                    <div>
                        <strong>{champion.viewCount ?? 0}</strong>
                        <span>阅读</span>
                    </div>

                    <div>
                        <strong>{champion.commentCount ?? 0}</strong>
                        <span>评论</span>
                    </div>
                </div>
            </div>
        </section>
    {/if}

    <!-- 第二第三 -->
    <section class="runnerups">
        {#each runnerUps as article, i}
            <article class="card">
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
                    <div class="rank">
                        #{i + 2}
                    </div>

                    <div class="title">
                        {article.title}
                    </div>

                    <div class="meta">
                        {article.author}
                    </div>

                    <div class="stats">
                        👍 {article.voteCount ?? 0}
                    </div>
                </div>
            </article>
        {/each}
    </section>

    <!-- 其余 -->
    <section class="list">
        {#each others as article, i}
            <article class="row">
                <div class="rank">
                    #{i + 4}
                </div>

                <div class="title">
                    {article.title}
                </div>

                <div class="author">
                    {article.author}
                </div>

                <div class="votes">
                    👍 {article.voteCount ?? 0}
                </div>
            </article>
        {/each}
    </section>
</div>

<style>
    .ranking {
        max-width: 1100px;
        margin: auto;
        padding: 20px;
    }

    /* 冠军 Hero */

    .champion {
        position: relative;
        /* width: 60%; */
        height: 420px;

        /* border-radius: 16px; */

        overflow: hidden;

        margin-bottom: 24px;

        background: #111;
    }

    .bg img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        filter: brightness(0.6);
    }

    .placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #444, #222);
    }

    .overlay {
        position: absolute;

        bottom: 0;

        padding: 32px;

        color: white;
    }


    .overlay h1 {
        font-size: 36px;
        margin: 0 0 10px;
    }

    .meta {
        opacity: 0.9;
        margin-bottom: 16px;
    }

    .stats {
        display: flex;
        gap: 30px;
    }

    .stats strong {
        font-size: 20px;
        display: block;
    }

    .stats span {
        /* font-size: 12px; */
        opacity: 0.8;
    }

    /* 第二第三 */

    .runnerups {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
    }

    .card {
        display: flex;
        background: #1b1b1b;
        color: white;
        /* border-radius: 12px; */
        overflow: hidden;
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

    .info {
        padding: 10px;
    }

    .rank {
        font-size: 24px;
        /* opacity: 0.7; */
    }

    .title {
        font-weight: bold;
    }

    .meta {
        /* font-size: 13px; */
        opacity: 0.7;
    }

    /* 其余 */

    .list {
        /* background: #161616; */

        /* border-radius: 12px; */

        overflow: hidden;
    }

    .row {
        display: grid;

        grid-template-columns: 60px 1fr 160px 100px;

        padding: 12px 16px;

        color: #ddd;

        border-bottom: 1px solid #2a2a2a;
    }

    .row:last-child {
        border-bottom: none;
    }

    .author {
        opacity: 0.7;
    }

    .votes {
        text-align: right;
    }

    /* 响应式 */

    @media (max-width: 700px) {
        .runnerups {
            grid-template-columns: 1fr;
        }

        .row {
            grid-template-columns: 50px 1fr 80px;
        }

        .author {
            display: none;
        }
    }
</style>
