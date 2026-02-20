<script lang="ts">
    import CommentItem from "$lib/components/article/CommentItem.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { Comment, User } from "$lib/models";
    import type { DataPage } from "$lib/mongolite";

    const { user, data }: { user: Partial<User>; data: DataPage<Comment> } =
        $props();

    let comments = $derived(data.items);
    let page = $derived(data.page);
</script>

{#if !data || data.items.length === 0}
    <p class="empty">暂无评论</p>
{:else}
    <div class="list">
        {#each comments as comment (comment._id)}
            <div>
                <CommentItem {comment} {user}
                    ><a class="link" href={`/articles/${comment.articleId}`}>
                        查看文章
                    </a></CommentItem
                >
            </div>
        {/each}
    </div>

    {#if data.totalPages > 1}
        <div class="mt-3 mb-3">
            <Pagination
                total={data.totalItems}
                limit={data.limit}
                page={data.page}
                formatUrl={(page) => {
                    return `?page=${page}`;
                }}
            ></Pagination>
        </div>
    {/if}
{/if}

<style>
    .empty {
        color: #aaa;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .link {
        font-size: 16px;
        /* width: 100%; */
    }
</style>
