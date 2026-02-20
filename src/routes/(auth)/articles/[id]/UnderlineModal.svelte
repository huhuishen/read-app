<script lang="ts">
    import CommentItem from "$lib/components/article/CommentItem.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import Popper from "$lib/components/overlay/Popper.svelte";
    import type { Comment, User } from "$lib/models";
    import type { UnderlineRange, UnderlineSel } from "$lib/models/underline";
    import type { UnderlineComment } from "$lib/models/underlineComments";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import { onMount } from "svelte";
    import Reply from "./Reply.svelte";

    let {
        show = $bindable(),
        articleId,
        version,
        user,
        underline,
        underlines = $bindable(),
        anchor = null,
    }: {
        show: boolean;
        articleId: string;
        version: number;
        user: Partial<User>;
        underline: UnderlineSel | null;
        underlines: Record<number, UnderlineRange[]>;
        anchor: HTMLElement | null;
    } = $props();

    let content = $state("");

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
        const data = await safeCall(
            api.post<{ insertedId: string }, typeof newReply>(
                `/api/articles/${articleId}/underline_replies`,
                newReply,
            ),
            toast,
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
    }

    async function submitRoot() {
        if (!content.trim()) return toast.show("请输入评论", "warn");
        const doc = {
            articleId,
            version,
            ...underline,
            user: user.name,
            userId: user.id,
            content,
        };

        const ranges = await safeCall(
            api.post<UnderlineRange[], Partial<UnderlineComment>>(
                `/api/articles/${articleId}/underlines`,
                doc,
            ),
            toast,
        );
        // console.log(JSON.stringify(underlines));
        if (underline?.segment && ranges) {
            underlines = {
                ...underlines,
                [underline.segment]: ranges,
            };
        }
        content = "";
        await load();
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

    let loading = $state(true);
    let showCreate = $state(false);
    const api = createApi();

    onMount(load);

    let comments = $state<UnderlineComment[]>();

    async function load() {
        loading = true;

        comments = await api.get<UnderlineComment[]>(
            `/api/articles/${articleId}/underlines?segment=${underline?.segment}&start=${underline?.start}&end=${underline?.end}`,
        );
        // console.log($state.snapshot(comments));

        loading = false;
    }
    async function toggleLike(c: Partial<Comment>, reply = false) {
        const data = await safeCall<{ liked: boolean }>(
            api.post(
                reply
                    ? `/api/underline_replies/${c._id}/toggle`
                    : `/api/underline_comments/${c._id}/toggle`,
            ),
            toast,
        );

        if (!data) return;

        c.liked = data.liked;
        c.likes = c.likes ?? 0;
        c.likes += c.liked ? 1 : -1;
    }
    async function removeComment(c: Partial<Comment>, reply = false) {
        await safeCall(
            api.delete(
                reply
                    ? `/api/underline_replies/${c._id}`
                    : `/api/underline_comments/${c._id}`,
            ),
            toast,
        );

        return true;
    }
    $effect(() => {
        if (show) {
            load();
        }
    });
    //            <Button onclick={() => (showCreate = !showCreate)}>评论</Button>
</script>

<Popper bind:show size="md" {anchor}>
    {#if loading}
        <p class="flex center gray">加载中...</p>
    {:else}
        <header class="drawer-header">
            <h2>划线评论 ({comments ? comments.length : 0})</h2>
        </header>

        <div class="comments">
            <div class="flex row g-2 mb-2">
                <Avatar name={user.name!}></Avatar>
                <div class="editor">
                    <input placeholder="留下您的评论..." bind:value={content} />
                </div>
                <button onclick={submitRoot}>发布</button>
            </div>
            {#if comments?.length === 0}
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
                            onRemove={(comment) => {
                                removeComment(comment);
                                comments = comments?.filter(
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
                                            onRemove={(comment) => {
                                                removeComment(comment, true);
                                                root.replies =
                                                    root.replies.filter(
                                                        (t) =>
                                                            t._id !==
                                                            comment._id,
                                                    );
                                            }}
                                            onLike={(c) => {
                                                toggleLike(c, true);
                                            }}
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
</Popper>

<!-- <Debug variable={comments}></Debug> -->
<style>
    h2 {
        font-size: 16px;
        margin: 0;
    }
    .drawer-header {
        /* position: sticky;
        top: 0; */
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--reader-bg-color);
        height: 60px;
        z-index: 2200;
        /* border-bottom: 1px solid #eee; */
    }
    .comments {
        font-size: 14px;
        padding: 1rem;
        min-height: 240px;
        max-height: 50vh;
    }
    .editor {
        flex: 1;
    }

    .editor input {
        height: 35px;
    }

    .root {
        padding: 1rem;
        /* border-bottom: 1px solid #eee; */
    }

    .replies {
        margin-top: 1rem;
        padding-left: 1rem;
        /* border-left: 2px solid #eee; */
        display: flex;
        flex-direction: column;
        /* gap: 0.8rem; */
    }

    .reply {
        /* background: var(--bg-soft, #f8f8f8); */
        padding: 10px;
        border-radius: 6px;
    }

    .gray {
        color: #aaa;
        min-height: 300px;
    }
</style>
