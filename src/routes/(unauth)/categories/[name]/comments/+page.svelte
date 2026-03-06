<script lang="ts">
    import { goto } from "$app/navigation";
    import CheckButton from "$lib/components/controls/CheckButton.svelte";
    import CommentItem from "$lib/components/article/CommentItem.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import CategoryTabs from "../CategoryTabs.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();

    function switchMode(mode: "user" | "article") {
        if (mode === data.mode) return;
        goto(`?mode=${mode}&page=1`, { replaceState: true });
    }
</script>

<CategoryTabs
    name={data.category?.alias ?? data.category?.name ?? data.params.name}
    active="comments"
>
    <div class="mode-switch">
        <CheckButton
            selected={data.mode === "user"}
            onclick={() => switchMode("user")}>按用户</CheckButton
        >
        <CheckButton
            selected={data.mode === "article"}
            onclick={() => switchMode("article")}>按文章</CheckButton
        >
    </div>

    {#if !data.groups || data.groups.items.length === 0}
        <p class="empty">暂无评论</p>
    {:else}
        <div class="groups">
            {#each data.groups.items as group}
                <section class="group">
                    <div class="group-head">
                        {#if data.mode === "user"}
                            <a
                                class="user"
                                href={`/profile/${group.userId}/comments`}
                                >{group.user} 的评论</a
                            >
                        {:else}
                            <a
                                class="user article-title"
                                href={`/articles/${group.articleId}`}
                                title={group.articleTitle}
                            >
                                {group.articleTitle}
                            </a>
                        {/if}
                        <span class="count">评论 {group.count}</span>
                    </div>
                    <div class="comments">
                        {#each group.comments as comment (comment._id)}
                            <div class="comment">
                                {#if data.mode === "user"}
                                    <div class="article-title mb-1">
                                        {comment.articleTitle}
                                    </div>{/if}
                                <CommentItem
                                    {comment}
                                    user={null}
                                    readonly
                                    showAvatar={data.mode !== "user"}
                                    showUser={data.mode !== "user"}
                                >
                                    {#if data.mode === "user"}
                                        <a
                                            class="article-link"
                                            href={`/articles/${comment.articleId}`}
                                        >
                                            查看文章
                                        </a>
                                    {:else}
                                        <a
                                            class="article-link"
                                            href={`/profile/${comment.userId}/comments`}
                                        >
                                            查看用户
                                        </a>
                                    {/if}
                                </CommentItem>
                            </div>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
        {#if data.groups.totalPages > 1}
            <div class="mt-3 mb-3">
                <Pagination
                    total={data.groups.totalItems}
                    limit={data.groups.limit}
                    page={data.groups.page}
                    formatUrl={(page) => `?mode=${data.mode}&page=${page}`}
                ></Pagination>
            </div>
        {/if}
    {/if}
</CategoryTabs>

<style>
    .empty {
        color: var(--link-disabled);
    }

    .mode-switch {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .groups {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .group {
        padding: 1rem 1rem 2rem 1rem;
        border-bottom: 1px dashed var(--border-soft);
    }

    .group-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .user {
        color: var(--text-primary);
        font-weight: 600;
    }

    .count {
        color: var(--text-faint);
        font-size: 0.9rem;
    }

    .comments {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
    }

    .comment {
        padding-top: 0.6rem;
        /* border-top: 1px dashed var(--border-soft); */
    }

    .comment:first-child {
        border-top: none;
        padding-top: 0;
    }

    .article-link {
        font-size: 0.95rem;
    }
</style>
