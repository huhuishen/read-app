<script lang="ts">
    import CommentItem from "$lib/components/article/CommentItem.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import CategoryTabs from "../CategoryTabs.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
</script>

<CategoryTabs
    name={data.category?.alias ?? data.category?.name ?? data.params.name}
    active="comments"
>
    {#if !data.groups || data.groups.items.length === 0}
        <p class="empty">暂无评论</p>
    {:else}
        <div class="groups">
            {#each data.groups.items as group}
                <section class="group">
                    <div class="group-head">
                        <a class="user" href={`/profile/${group.userId}/comments`}
                            >@{group.user}</a
                        >
                        <span class="count">评论 {group.count}</span>
                    </div>
                    <div class="comments">
                        {#each group.comments as comment (comment._id)}
                            <div class="comment">
                                <CommentItem {comment} user={null} readonly>
                                    <a
                                        class="article-link"
                                        href={`/articles/${comment.articleId}`}
                                    >
                                        查看文章
                                    </a>
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
                    formatUrl={(page) => `?page=${page}`}
                ></Pagination>
            </div>
        {/if}
    {/if}
</CategoryTabs>

<style>
    .empty {
        color: var(--link-disabled);
    }

    .groups {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .group {
        padding: 1rem;
        /* border: 1px solid var(--border-soft); */
        /* border-radius: 8px; */
        /* background: var(--surface-soft); */
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
        border-top: 1px dashed var(--border-soft);
    }

    .comment:first-child {
        border-top: none;
        padding-top: 0;
    }

    .article-link {
        font-size: 0.95rem;
    }
</style>

