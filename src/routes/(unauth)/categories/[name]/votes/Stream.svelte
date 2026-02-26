<script lang="ts">
    import type { Article } from "$lib/models";
    import Card from "./Card.svelte";
    import { rankByVotes, type RankedArticle } from "./rank";

    const { items }: { items: Partial<Article>[] } = $props();

    let rankedArticles = $derived(rankByVotes(items));

    function displayRank(list: RankedArticle[], index: number) {
        if (index === 0) return list[index].rank;
        if (list[index].rank !== list[index - 1].rank) return list[index].rank;
        return undefined;
    }
</script>

<div class="flex center g-3 mb-3 ranking">
    {#each rankedArticles as article, i}
        <Card
            {article}
            number={displayRank(rankedArticles, i)}
            size={article.rank === 1 ? "xl" : article.rank <= 3 ? "lg" : "sm"}
        ></Card>
    {/each}
</div>

<style>
    .ranking {
        /* min-width: 500px; */
    }
</style>
