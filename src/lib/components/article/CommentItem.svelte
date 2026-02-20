<script lang="ts">
    import Avatar from "$lib/components/Avatar.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import StarRating from "$lib/components/StarRating.svelte";
    import type { User } from "$lib/models";
    import { type Comment } from "$lib/models";
    import { createApi } from "$lib/util/apiRequest";
    import { stringSegment, toLocalDateString } from "$lib/util/client";
    import { onMount, type Snippet } from "svelte";

    let {
        comment,
        user,
        onRemove,
        onLike,
        onReply,
        children,
    }: {
        comment: Partial<Comment>;
        user: Partial<User> | null;
        onRemove?: ((comment: Partial<Comment>) => void) | null;
        onLike?: ((comment: Partial<Comment>) => void) | null;
        onReply?: ((comment: Partial<Comment>) => void) | null;
        children?: Snippet;
    } = $props();

    let container: HTMLDivElement;

    let expanded = $state(false);
    let overflow = $state(false);
    const MAX_HEIGHT = 200; // 200px

    function checkOverflow() {
        if (!container) return;
        overflow = container.scrollHeight > MAX_HEIGHT;
    }

    onMount(checkOverflow);

    $effect(() => {
        comment.content;
        queueMicrotask(checkOverflow);
    });
</script>

<div class="comment" class:collapsed={!expanded} bind:this={container}>
    <!-- 头像及发表日期，评分（如果有） -->
    <div class="flex g-3 mb-1">
        <div class="flex g-2">
            <Avatar name={comment.user!}></Avatar>
            <a class="ml1" href={`/profile/${comment.userId}/articles`}
                >{comment.user}</a
            >
        </div>
        <div class="gray">
            {toLocalDateString(comment.createdAt)}
        </div>
        {#if comment.rating}
            <StarRating value={comment.rating} size={17} readonly />
        {/if}
    </div>

    <div class="g-2 mb-1">
        {#if comment.replyTo}
            <div class="flex g-2 quote">
                <span>@{comment.replyTo}</span>
                <span>“{comment.quote}”:</span>
            </div>
        {/if}
        {#each stringSegment(comment.content!) as seg}
            <p>{seg.text}</p>
        {/each}
        {#if overflow && !expanded}
            <div class="flex center fade">
                <button class="toggle" onclick={() => (expanded = true)}
                    >展开更多内容</button
                >
            </div>
        {/if}
    </div>

    <!-- 点赞及回复按钮 -->
    <div class="flex g-4">
        <Button
            variant="link"
            onclick={() => {
                // toggleLike(comment);
                onLike?.(comment);
            }}
        >
            <Icon
                name="thumbs_up"
                size={16}
                color={comment.liked ? "brown" : "#ccc"}
            ></Icon>
            <span>{comment.likes ? comment.likes : ""}</span>
        </Button>
        {#if user?.id !== comment.userId}
            <Button
                variant="link"
                onclick={() => {
                    onReply?.(comment);
                }}><span>回复</span></Button
            >
        {:else}
            <Button
                variant="link"
                onclick={async () => {
                    onRemove?.(comment);
                }}>[删除]</Button
            >
        {/if}
        {@render children?.()}
    </div>
</div>

<style>
    .comment {
        line-height: 1.5em;
        /* font-size: 14px; */
        position: relative;
        transition: max-height 0.25s ease;
    }
    .collapsed {
        max-height: 200px;
        overflow: hidden;
    }
    .quote {
        color: #777;
    }
    .fade {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 40px;
        background: linear-gradient(to bottom, transparent, #fff);
    }

    /* 展开按钮 */
    .toggle {
        background-color: #f1f1f1;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        padding: 5px 20px;
    }

    .toggle:hover {
        background-color: #eee;
    }
</style>
