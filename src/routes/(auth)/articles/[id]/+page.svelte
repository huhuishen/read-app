<script lang="ts">
    import { browser } from "$app/environment";
    import Debug from "$lib/components/Debug.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import type { UnderlineRange, UnderlineSel } from "$lib/models/underline";
    import type { UnderlineComment } from "$lib/models/underlineComments";
    import { toast } from "$lib/stores/toast.svelte.js";
    import { underlineManager } from "$lib/stores/underlines.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import { stringSegment } from "$lib/util/client";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import ArticleSegment from "./ArticleSegment.svelte";
    import BottomBar from "./BottomBar.svelte";
    import CheckButton from "./CheckButton.svelte";
    import CommentDrawer from "./CommentDrawer.svelte";
    import FloatBar from "./FloatBar.svelte";
    import { ReadTimer } from "./realTimer";
    import UnderlineModal from "./UnderlineModal.svelte";

    const { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    const article = $state(data.article);
    const segments = $derived(stringSegment(article.content));

    let underlines = $state<Record<number, UnderlineRange[]>>({});
    $effect(() => {
        const obj: Record<number, UnderlineRange[]> = {};

        for (const u of data.underlines) {
            obj[u.segment] = u.ranges;
        }

        underlines = obj;
    });

    let underlineSel = $state<UnderlineSel | null>(null);
    let underlineAct = $state<UnderlineSel | null>(null);

    let UnderlineComments = $state<UnderlineComment[] | null>(null);

    let range: Range | null = null;

    const api = createApi();

    function saveSelection() {
        if (!browser) return null;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        return selection.getRangeAt(0).cloneRange();
    }

    function restoreSelection(savedRange: Range | null) {
        if (!browser) return;

        const selection = window.getSelection();
        if (selection && savedRange) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
        }
    }

    function exportUnderlines() {
        const blob = new Blob(
            [JSON.stringify(underlineManager.underlines, null, 2)],
            {
                type: "application/json",
            },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `underlines.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleSelectionChange() {
        underlineSel = null;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            return;
        }

        const range = selection.getRangeAt(0);
        let target = range.startContainer;
        if (target.nodeType === Node.TEXT_NODE) {
            target = target.parentElement as Node;
        }

        if ((target as Element).nodeName === "SPAN") {
            target = target.parentElement as Node;
        }

        if ((target as Element).nodeName !== "P") {
            return;
        }

        const id = (target as Element).getAttribute("data-segment");
        if (!id) {
            return;
        }

        const segment = parseInt(id, 10);

        // 段落选区前面的文字长度
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(target);
        const maxlen = preSelectionRange.toString().length;
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const text = selection.toString().trim();
        const end = start + text.length;

        if (end > maxlen) {
            return;
        }

        underlineSel = { segment, start, end, text };
        // console.log($state.snapshot(selectedUnderline));
    }

    function toggleTheme() {
        const html = document.documentElement;
        const theme = html.getAttribute("data-theme");
        html.setAttribute("data-theme", theme === "dark" ? "light" : "dark");
    }

    let spanAct = $state<HTMLSpanElement | null>(null);

    async function showUnderlineComment(
        segment: number,
        underline: UnderlineRange,
        span: HTMLSpanElement,
    ) {
        // toast.show(JSON.stringify({ segment, underline }), "warn");
        underlineAct = { segment, ...underline, text: "" };
        spanAct = span;
        showUnderlineModal = true;
        // const url = `/api/underline_comments?aid=${article._id}&seg=${underline.seg}&start=${underline.start}&end=${underline.end}`;
        // const url = `/api/underline_comments?aid=${article._id}&seg=${underline.segment}`;

        // await safeCall(api.get(), toast);
    }

    function getTopVisibleParagraph(): number | null {
        const x = window.innerWidth / 2;
        const y = 10; // 视口顶部往下 10px
        const elements = document.elementsFromPoint(x, y);

        for (const el of elements) {
            let p: HTMLParagraphElement | null = null;

            if (el instanceof HTMLParagraphElement) {
                p = el;
            } else {
                p = el.closest("p");
            }

            if (p) {
                const v = parseInt(p.getAttribute("data-segment") ?? "0");
                return v;
            }
        }

        return null;
    }

    // svelte-ignore state_referenced_locally
    let maxScrollPercent = $state(data.article.completion ?? 0);
    let maxScrollableSeen = 0;

    function updateScrollProgress() {
        const scrollTop = Math.max(window.scrollY, 0);

        // console.log(
        //     `scrollTop: ${scrollTop}, maxScrollableSeen: ${maxScrollableSeen}, maxScrollPercent: ${maxScrollPercent}`,
        // );

        if (maxScrollableSeen <= 0) return;

        const percent = Math.min(scrollTop / maxScrollableSeen, 1);

        maxScrollPercent = Math.max(maxScrollPercent, percent);
    }

    onMount(() => {
        if (!browser) return;

        const timer = new ReadTimer(
            (duration) => {
                api.post(`/api/articles/${article.id}/stats`, {
                    action: "read",
                    value: duration,
                    completion: maxScrollPercent,
                });
                // console.log(`更新阅读时长 ${duration}s`);
            },
            {
                interval: 60_000,
                idleThreshold: 60_000,
            },
        );

        // 等待 layout 稳定
        requestAnimationFrame(() => {
            const doc = document.documentElement;

            maxScrollableSeen = Math.max(
                doc.scrollHeight - doc.clientHeight,
                0,
            );

            updateScrollProgress();
        });

        document.addEventListener("selectionchange", handleSelectionChange);
        document.addEventListener("scroll", updateScrollProgress, {
            passive: true,
        });

        return () => {
            document.removeEventListener(
                "selectionchange",
                handleSelectionChange,
            );
            document.removeEventListener("scroll", handleSelectionChange);
            timer.destroy();
        };
    });

    let actions = [
        {
            label: "设置",
            icon: "settings",
            onclick: toggleTheme,
        },
        {
            label: "评论",
            icon: "pencil",
            disabled: () => underlineSel === null,
            onclick: () => {
                range = saveSelection();
                underlineAct = underlineSel;
                UnderlineComments = [];
                showUnderlineModal = !showUnderlineModal;
                setTimeout(function () {
                    document.getElementById("textarea")?.focus();
                }, 0);
            },
        },
        {
            label: "滚动到顶部",
            icon: "arrow_up",
            onclick: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        },
        {
            label: "评论区",
            icon: "message-square-more",
            onclick: () => {
                showCommentDrawer = !showCommentDrawer;
                // let p = getTopVisibleParagraph();
                // console.log(p);
            },
        },
    ];

    let showCommentDrawer = $state(false);
    let showUnderlineModal = $state(false);

    /*
    <CommentModal
    bind:show={dataCommentModal.show}
    bind:comment={dataCommentModal.comment}
    quote={currentUnderline?.text}
    onSubmit={handleCommentSubmit}
    onClose={() => {
        dataCommentModal.show = false;
        restoreSelection(range);
    }}
></CommentModal>
    */
</script>

<svelte:head>
    <title>{article.title} - 阅读</title>
</svelte:head>

<div class="content title mb-3">
    <h1>{article.title}</h1>
</div>

<div class="content">
    {#each segments as segment, id}
        <ArticleSegment
            text={segment.text}
            segment={id}
            {underlines}
            onclick={showUnderlineComment}
            endmark={id === segments.length - 1}
        />
    {/each}
</div>

<div class="flex footer">
    <CheckButton
        selected={article.bookmarked}
        onclick={async () => {
            await safeCall(
                api.post(`/api/articles/${article.id}/stats`, {
                    action: "bookmark",
                    value: !article.bookmarked,
                }),
                toast,
            );
            article.bookmarked = !article.bookmarked;
        }}><Icon name="bookmark2"></Icon>关注</CheckButton
    >
    <CheckButton
        selected={article.voted}
        onclick={async () => {
            await safeCall(
                api.post(`/api/articles/${article.id}/stats`, {
                    action: "vote",
                    value: !article.voted,
                }),
                toast,
            );
            article.voted = !article.voted;
        }}><Icon name="vote"></Icon>为本作品投票</CheckButton
    >
</div>

<!-- 桌面版右下浮动工具条 -->
<div class="float-button">
    <FloatBar {actions}></FloatBar>
</div>

<!-- 移动端底部弹出浮动工具条 -->
<BottomBar {actions} />

<!-- 划线评论 -->
<UnderlineModal
    bind:show={showUnderlineModal}
    articleId={article.id}
    version={article.version}
    user={data.user}
    underline={underlineAct}
    bind:underlines
    anchor={spanAct}
></UnderlineModal>

<!-- 评分及评论 -->
<CommentDrawer
    bind:show={showCommentDrawer}
    articleId={article.id}
    user={data.user}
></CommentDrawer>

<!-- <Debug variable={underlineSel} /> -->

<style>
    .title {
        color: var(--header-color);
    }
    .title h1 {
        font-weight: 600;
        font-size: 32px;
        color: var(--header-color);
        font-family: "Times New Roman", Times, serif;
    }

    .float-button {
        z-index: 1000;
        gap: 20px;
        position: fixed;
        bottom: 100px;
        /* right: max(0px, calc((100% - 800px) / 2)); */
        right: calc(max((100% - 800px) / 2 - 80px, 20px));
    }

    @media (max-width: 768px) {
        .float-button {
            display: none;
        }
    }

    .footer {
        justify-content: center;
        padding: 3em 0;
        margin: 3em 0;
        border-top: 1px solid var(--link-disabled);
        gap: 2em;
    }
</style>
