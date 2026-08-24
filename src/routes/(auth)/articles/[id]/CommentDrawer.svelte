<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Drawer from "$lib/components/overlay/Drawer.svelte";
    import StarRating from "$lib/components/StarRating.svelte";
    import type { Comment, User } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { api } from "$lib/api/client";
    import { onMount } from "svelte";
    import CommentItem from "$lib/components/article/CommentItem.svelte";
    import Reply from "./Reply.svelte";
    import { loading } from "$lib/stores/loading.svelte";

    /* ---------------- props ---------------- */

    let {
        show = $bindable(),
        articleId,
        user,
    }: { show: boolean; articleId: string; user: Partial<User> } = $props();

    /* ---------------- state ---------------- */

    let isLoading = $state(true);
    let comments = $state<Comment[]>([]);
    let content = $state("");
    let rating = $state(0);

    async function load() {
        loading.start();
        isLoading = true;

        comments = await api.get<Comment[]>(`articles/${articleId}/comments`);

        loading.stop();
        isLoading = false;
    }

    async function submitRoot() {
        if (!content.trim()) return toast.show("请输入评论", "warn");
        if (rating === 0) return toast.show("请评分", "warn");

        try {
            await api.post(`articles/${articleId}/comments`, {
                articleId,
                content,
                rating,
            });
            content = "";
            rating = 0;
            await load();
        } catch {
            /* 错误已自动弹出 */
        }
    }

    async function submitReply(root: Partial<Comment>) {
        if (!activeComment) return;
        if (!replyContent.trim()) return;

        const newReply = {
            articleId,
            parentId: root._id,
            content: replyContent,
            user: user.name,
            userId: user.id,
            createdAt: new Date(),
            quote: activeReply?.content ?? undefined,
            replyTo: activeReply?.user ?? undefined,
        };

        try {
            const data = await api.post<{ insertedId: string }>(
                `articles/${articleId}/comments`,
                newReply,
            );

            if (!data?.insertedId) return;

            root.replies = root.replies ?? [];
            root.replies = [
                {
                    _id: data.insertedId,
                    ...newReply,
                },
                ...root.replies,
            ];

            replyContent = "";
            activeComment = null;
        } catch {
            /* 错误已自动弹出 */
        }
    }

    function toggleOpen(comment: Partial<Comment>) {
        if (activeComment === comment) {
            open = !open;
        } else {
            open = true;
        }
        activeComment = comment;
    }

    let open = $state(false);
    let replyContent = $state("");
    let activeComment = $state<Partial<Comment> | null>();
    let activeReply = $state<Partial<Comment> | null>();

    async function toggleLike(c: Partial<Comment>) {
        try {
            const data = await api.post<{ liked: boolean }>(
                `comments/${c._id}/toggle`,
            );

            c.liked = data.liked;
            c.likes = c.likes ?? 0;
            c.likes += c.liked ? 1 : -1;
        } catch {
            /* 错误已自动弹出 */
        }
    }
    async function removeComment(c: Partial<Comment>) {
        try {
            await api.del(`comments/${c._id}`);
        } catch {
            /* 错误已自动弹出 */
        }

        return true;
    }
    onMount(load);
</script>

<Drawer bind:show size="lg">
    {#if isLoading}
        <p class="gray">加载中...</p>
    {:else}
        <header class="drawer-header">
            <Button variant="link" onclick={() => (show = false)}>
                <Icon name="chevron-left" size={26} />返回
            </Button>
        </header>

        <div class="comments">
            <h2>评论区 ({comments.length})</h2>

            {#if comments[0]?.userId !== user.id}
                <section class="editor">
                    <textarea placeholder="留下您的评论..." bind:value={content}
                    ></textarea>

                    <div class="rating-row">
                        <span>评分 {rating}</span>
                        <StarRating bind:value={rating} size={20} />
                    </div>

                    <button onclick={submitRoot}>发布评论</button>
                </section>
            {/if}

            {#if comments.length === 0}
                <p class="gray">暂无评论</p>
            {:else}
                {#each comments as root}
                    <div class="root">
                        <CommentItem
                            comment={root}
                            {user}
                            onReply={(comment) => {
                                toggleOpen(comment);
                                activeReply = null;
                                replyContent = "";
                            }}
                            onRemove={async (comment) => {
                                removeComment(comment);
                                comments = comments.filter(
                                    (t) => t._id !== comment._id,
                                );
                            }}
                            onLike={toggleLike}
                        ></CommentItem>
                        {#if open && activeComment?._id === root._id}
                            <Reply
                                bind:cotent={replyContent}
                                disabled={!replyContent.trim()}
                                placeholder="写下你的回复..."
                                onclick={() => submitReply(root)}
                            ></Reply>
                        {/if}

                        <!-- 回复列表 -->
                        {#if root.replies?.length > 0}
                            <div class="replies">
                                {#each root.replies as reply}
                                    <div class="reply">
                                        <CommentItem
                                            comment={reply}
                                            {user}
                                            onReply={(comment) => {
                                                toggleOpen(comment);
                                                activeReply = reply;
                                                replyContent = "";
                                            }}
                                            onRemove={async (comment) => {
                                                removeComment(comment);

                                                root.replies =
                                                    root.replies.filter(
                                                        (t) =>
                                                            t._id !==
                                                            comment._id,
                                                    );
                                            }}
                                            onLike={toggleLike}
                                        ></CommentItem>
                                        {#if open && activeComment?._id === reply._id}
                                            <Reply
                                                bind:cotent={replyContent}
                                                placeholder="回复 @{reply.user}"
                                                disabled={!replyContent.trim()}
                                                onclick={() => {
                                                    submitReply(root);
                                                }}
                                            ></Reply>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</Drawer>

<style>
    h2 {
        font-size: 20px;
        margin: 0.5rem 0;
    }
    .drawer-header {
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 10px;
        background-color: var(--main-bg-color);
        height: 60px;
        z-index: 2200;
    }
    .comments {
        font-size: 16px;
        padding: 0 1rem;
    }
    .editor {
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .rating-row {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .root {
        padding: 1rem;
        /* border-bottom: 1px solid var(--border-soft); */
    }

    .replies {
        margin-top: 1rem;
        padding-left: 1rem;
        /* border-left: 2px solid var(--border-soft); */
        display: flex;
        flex-direction: column;
        /* gap: 0.8rem; */
    }

    .reply {
        /* background: var(--bg-soft, #f8f8f8); */
        padding: 10px;
        border-radius: 6px;
    }

    /* blockquote {
        margin: 0.5rem 0;
        padding-left: 0.8rem;
        border-left: 3px solid var(--border-default);
        color: var(--text-secondary);
        font-size: 13px;
    } */

    .gray {
        color: var(--link-disabled);
    }
</style>
