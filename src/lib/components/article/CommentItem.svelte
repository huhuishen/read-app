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
        readonly = false,
        showAvatar = true,
        showUser = true,
        ratingDisplay = "stars",
        onRemove,
        onLike,
        onReply,
        children,
    }: {
        comment: Partial<Comment>;
        user: Partial<User> | null;
        readonly?: boolean;
        showAvatar?: boolean;
        showUser?: boolean;
        ratingDisplay?: "stars" | "single" | "none";
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

<div class="comment" bind:this={container}>
    <!-- 头像及发表日期，评分（如果有�?-->
    <div class="flex g-3 mb-1 gray">
        {#if showAvatar || showUser}
            <div class="flex g-2">
                {#if showAvatar}
                    <Avatar name={comment.user!}></Avatar>
                {/if}
                {#if showUser}
                    <a class="ml1" href={`/profile/${comment.userId}/articles`}
                        >{comment.user}</a
                    >
                {/if}
            </div>
        {/if}
        <div class="">
            {toLocalDateString(comment.createdAt)}
        </div>
        {#if comment.rating && ratingDisplay !== "none"}
            {#if ratingDisplay === "single"}
                <span class="single-rating">
                    <Icon
                        name="star"
                        size={14}
                        fill="var(--warning)"
                        color="var(--warning)"
                    />
                    <span>{comment.rating.toFixed(1)}</span>
                </span>
            {:else}
                <StarRating value={comment.rating} size={17} readonly />
            {/if}
        {/if}
    </div>

    <div class="flex g-2" class:collapsed={!expanded}>
        {#if comment.replyTo}
            <div class="flex g-2 quote">
                <span>@{comment.replyTo}</span>
                <span>"{comment.quote}":</span>
            </div>
        {/if}
        {#each stringSegment(comment.content!) as seg}
            <p>{seg.text}</p>
        {/each}
        {#if overflow && !expanded}
            <div class="flex center fade"></div>
        {/if}
    </div>
    {#if overflow && !expanded}
        <Button variant="link" onclick={() => (expanded = true)}>展开</Button>
    {/if}

    <!-- 点赞及回复按�?-->
    {#if !readonly}
        <div class="flex g-4 mt-1">
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
                    color={comment.liked
                        ? "var(--danger-hover)"
                        : "var(--text-faint)"}
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
    {/if}
</div>

<style>
    .comment {
        line-height: 1.5em;
        /* font-size: 14px; */
        position: relative;
        transition: max-height 0.25s ease;
    }
    .collapsed {
        max-height: 180px;
        overflow: hidden;
        position: relative;
    }
    .quote {
        color: var(--link-color);
    }
    .fade {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 40px;
        background: linear-gradient(
            to bottom,
            transparent,
            var(--main-bg-color)
        );
    }
    .gray {
        color: var(--text-faint);
    }
    .single-rating {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }
</style>
