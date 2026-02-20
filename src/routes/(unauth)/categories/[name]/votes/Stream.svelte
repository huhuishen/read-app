<script lang="ts">
    import type { Article } from "$lib/models";
    import Card from "./Card.svelte";

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

<div class="flex center g-3 mb-3 ranking">
    <!-- 冠军 -->
    {#if champion}
        <Card article={champion} number={1} size="xl"></Card>

        <!-- <section class="champion">
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
        </section> -->
    {/if}

    <!-- 第二第三 -->
    {#each runnerUps as article, i}
        <Card {article} number={i + 2} size="lg"></Card>
    {/each}

    <!-- 其余 -->
    {#each others as article, i}
        <Card {article} number={i + 4}></Card>
    {/each}
</div>

<style>
    .ranking {
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

    .info {
        padding: 10px;
    }

    .rank {
        font-size: 24px;
    }

    .title {
        font-weight: bold;
    }

    .meta {
        /* font-size: 13px; */
        opacity: 0.7;
    }

    @media (max-width: 700px) {
        .runnerups {
            grid-template-columns: 1fr;
        }
    }
</style>
