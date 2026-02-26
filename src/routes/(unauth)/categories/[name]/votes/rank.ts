import type { Article } from "$lib/models";

export type RankedArticle = Partial<Article> & {
    rank: number;
};

export function rankByVotes(articles: Partial<Article>[]): RankedArticle[] {
    let currentRank = 0;
    let lastVotes: number | undefined | null = null;
    let index = 0;

    return articles.map((article) => {
        index++;

        // 投票数不同 → 更新排名
        if (article.voteCount !== lastVotes) {
            currentRank = index;
            lastVotes = article.voteCount;
        }

        return {
            ...article,
            rank: currentRank
        };
    });
}