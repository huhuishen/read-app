<script lang="ts">
    import Avatar from "$lib/components/Avatar.svelte";
    import Modal from "$lib/components/overlay/Modal.svelte";
    import type { Article } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import { toLocalDateString } from "$lib/util/client";
    import Card from "./Card.svelte";
    import { rankByVotes, type RankedArticle } from "./rank";

    type VoteUser = {
        id: string;
        name: string;
        avatarColor?: string;
        votedAt?: Date;
    };

    const { items }: { items: Partial<Article>[] } = $props();

    const api = createApi();
    let rankedArticles = $derived(rankByVotes(items));

    let showVotersModal = $state(false);
    let selectedArticle = $state<Partial<Article> | null>(null);
    let voters = $state<VoteUser[]>([]);
    let loadingVoters = $state(false);

    function displayRank(list: RankedArticle[], index: number) {
        if (index === 0) return list[index].rank;
        if (list[index].rank !== list[index - 1].rank) return list[index].rank;
        return undefined;
    }

    function userInitial(name: string) {
        return (name || "?").trim().slice(0, 1).toUpperCase();
    }

    async function openVoters(article: Partial<Article>) {
        if (!article.id) return;

        selectedArticle = article;
        showVotersModal = true;
        loadingVoters = true;
        voters = [];

        const data = await safeCall(
            api.get<VoteUser[]>(`/api/articles/${article.id}/voters`),
            toast,
        );

        if (data) {
            voters = data;
        }

        loadingVoters = false;
    }
</script>

<div class="flex center g-3 mb-3">
    {#each rankedArticles as article, i}
        <Card
            {article}
            number={displayRank(rankedArticles, i)}
            size={article.rank === 1 ? "xl" : article.rank <= 3 ? "lg" : "sm"}
            onVoteClick={openVoters}
        ></Card>
    {/each}
</div>

<Modal bind:show={showVotersModal} size="sm" title="投票人员" closeButton={true}>
    <div class="voters-modal">
        {#if loadingVoters}
            <p class="hint">加载中...</p>
        {:else if voters.length === 0}
            <p class="hint">暂无投票</p>
        {:else}
            <ul class="voter-list">
                {#each voters as user}
                    <li class="voter-item">
                        <Avatar name={user.name}></Avatar>
                        <div class="info">
                            <div class="name">{user.name}</div>
                            <div class="time">
                                {toLocalDateString(user.votedAt)}
                            </div>
                        </div>
                        <div class="vote-count">+1</div>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</Modal>

<style>
    .voters-modal {
        padding: 1rem;
    }

    .hint {
        margin: 14px 0 0;
        color: var(--text-secondary);
        text-align: center;
    }

    .voter-list {
        list-style: none;
        margin: 12px 0 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 320px;
        overflow: auto;
    }

    .voter-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: var(--main-bg-color);
    }

    .info {
        flex: 1;
        min-width: 0;
    }

    .vote-count {
        margin-left: auto;
    }

    .time {
        font-size: 13px;
        color: var(--text-faint);
    }
</style>
