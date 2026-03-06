<script lang="ts">
    import { browser } from "$app/environment";
    import Debug from "$lib/components/Debug.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import type { UnderlineRange, UnderlineSel } from "$lib/models/underline";
    import type { UnderlineComment } from "$lib/models/underlineComments";
    import { toast } from "$lib/stores/toast.svelte.js";
    import { underlineManager } from "$lib/stores/underlines.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import { stringSegment, toLocalDateString } from "$lib/util/client";
    import { onMount } from "svelte";
    import Modal from "$lib/components/overlay/Modal.svelte";
    import type { PageProps } from "./$types";
    import ArticleSegment from "./ArticleSegment.svelte";
    import BottomBar from "./BottomBar.svelte";
    import CheckButton from "$lib/components/controls/CheckButton.svelte";
    import CommentDrawer from "./CommentDrawer.svelte";
    import FloatBar from "./FloatBar.svelte";
    import { ReadTimer } from "./realTimer";
    import UnderlineModal from "./UnderlineModal.svelte";
    import { getTheme, setTheme } from "../../../util";

    const { data }: PageProps = $props();

    const article = $derived(data.article);
    // svelte-ignore state_referenced_locally
    const userStats = $state(data.userStats);
    const voteEnd = $derived.by(
        () => new Date() > new Date(article.category?.voteEnd ?? ""),
    );

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
    type ReaderOption = { label: string; value: string };
    type ThemeOption = { label: string; value: "light" | "dark" };

    const THEME_OPTIONS: ThemeOption[] = [
        { label: "浅色", value: "light" },
        { label: "深色", value: "dark" },
    ];
    const FONT_OPTIONS: ReaderOption[] = [
        {
            label: "宋体",
            value: '"Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", serif',
        },
        {
            label: "黑体",
            value: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
        },
        {
            label: "楷体",
            value: '"Kaiti SC", "STKaiti", "KaiTi", serif',
        },
        {
            label: "仿宋",
            value: '"STFangsong", "FangSong", serif',
        },
        {
            label: "圆体",
            value: '"YouYuan", "Arial Rounded MT Bold", "PingFang SC", sans-serif',
        },
        {
            label: "系统默认",
            value: '-apple-system, "SF Pro SC", "Segoe UI", "Roboto", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
    ];
    const FONT_SIZE_OPTIONS: ReaderOption[] = [
        { label: "小 (16px)", value: "16px" },
        { label: "中 (20px)", value: "20px" },
        { label: "大 (24px)", value: "24px" },
        { label: "特大 (28px)", value: "28px" },
    ];

    const READER_THEME_KEY = "reader.theme";
    const READER_FONT_KEY = "reader.font.family";
    const READER_FONT_SIZE_KEY = "reader.font.size";

    let showSettingsModal = $state(false);
    let selectedTheme = $state<"light" | "dark">("light");
    let selectedFont = $state(FONT_OPTIONS[0].value);
    let selectedFontSize = $state(FONT_SIZE_OPTIONS[1].value);

    function openSettings() {
        showSettingsModal = true;
    }

    function applyReaderPreferences() {
        const root = document.documentElement;
        root.style.setProperty("--reader-font-family", selectedFont);
        root.style.setProperty("--reader-font-size", selectedFontSize);
        setTheme(selectedTheme);

        localStorage.setItem(READER_THEME_KEY, selectedTheme);
        localStorage.setItem(READER_FONT_KEY, selectedFont);
        localStorage.setItem(READER_FONT_SIZE_KEY, selectedFontSize);
    }

    function initReaderPreferences() {
        const currentTheme = getTheme();
        if (currentTheme === "dark" || currentTheme === "light") {
            selectedTheme = currentTheme;
        }

        const savedTheme = localStorage.getItem(READER_THEME_KEY);
        if (savedTheme === "dark" || savedTheme === "light") {
            selectedTheme = savedTheme;
        }

        const savedFont = localStorage.getItem(READER_FONT_KEY);
        if (savedFont && FONT_OPTIONS.some((o) => o.value === savedFont)) {
            selectedFont = savedFont;
        }

        const savedFontSize = localStorage.getItem(READER_FONT_SIZE_KEY);
        if (
            savedFontSize &&
            FONT_SIZE_OPTIONS.some((o) => o.value === savedFontSize)
        ) {
            selectedFontSize = savedFontSize;
        }

        applyReaderPreferences();
    }

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

        // 段落选区前面的文本长度
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
        // const url = `/api/underline-comments?aid=${article._id}&seg=${underline.seg}&start=${underline.start}&end=${underline.end}`;
        // const url = `/api/underline-comments?aid=${article._id}&seg=${underline.segment}`;

        // await safeCall(api.get(), toast);
    }

    function getTopVisibleParagraph(): number | null {
        const x = window.innerWidth / 2;
        const y = 10; // 视口顶部向下 10px
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
    let maxScrollPercent = $state(data.userStats.completion ?? 0);
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
        initReaderPreferences();

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
            document.removeEventListener("scroll", updateScrollProgress);
            timer.destroy();
        };
    });

    let actions = [
        {
            label: "设置",
            icon: "settings",
            onclick: openSettings,
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
            label: "回到顶部",
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
        selected={userStats.bookmarked}
        onclick={async () => {
            await safeCall(
                api.post(`/api/articles/${article.id}/stats`, {
                    action: "bookmark",
                    value: !userStats.bookmarked,
                }),
                toast,
            );
            userStats.bookmarked = !userStats.bookmarked;
        }}><Icon name="bookmark2"></Icon>关注</CheckButton
    >
    <CheckButton
        selected={userStats.voted}
        disabled={voteEnd}
        title={voteEnd
            ? `投票已于 ${toLocalDateString(article.category?.voteEnd)} 截止`
            : `投票将于 ${toLocalDateString(article.category?.voteEnd)} 截止`}
        onclick={async () => {
            const r = await safeCall<{ remain: number }>(
                api.post(`/api/articles/${article.id}/vote`, {
                    value: !userStats.voted,
                }),
                toast,
            );

            if (r) {
                userStats.voted = !userStats.voted;
                toast.show(`本期征文剩余投票 ${r.remain}`);
            }
        }}><Icon name="vote"></Icon>为本作品投票</CheckButton
    >
</div>

<!-- 桌面端右下浮动工具栏 -->
<div class="float-button">
    <FloatBar {actions}></FloatBar>
</div>

<!-- 移动端底部浮动工具栏 -->
<BottomBar {actions} />

<Modal
    bind:show={showSettingsModal}
    closeButton={true}
    title="阅读设置"
    size="md"
>
    <div class="settings-modal">
        <section class="setting-section">
            <p>主题</p>
            <div class="setting-options">
                {#each THEME_OPTIONS as option}
                    <CheckButton
                        selected={selectedTheme === option.value}
                        onclick={() => {
                            selectedTheme = option.value;
                            applyReaderPreferences();
                        }}
                    >
                        {option.label}
                    </CheckButton>
                {/each}
            </div>
        </section>

        <section class="setting-section">
            <p>字体</p>
            <div class="setting-options">
                {#each FONT_OPTIONS as option}
                    <CheckButton
                        selected={selectedFont === option.value}
                        onclick={() => {
                            selectedFont = option.value;
                            applyReaderPreferences();
                        }}
                    >
                        <span style={`font-family: ${option.value};`}
                            >{option.label}</span
                        >
                    </CheckButton>
                {/each}
            </div>
        </section>

        <section class="setting-section">
            <p>字号</p>
            <div class="setting-options">
                {#each FONT_SIZE_OPTIONS as option}
                    <CheckButton
                        selected={selectedFontSize === option.value}
                        onclick={() => {
                            selectedFontSize = option.value;
                            applyReaderPreferences();
                        }}
                    >
                        {option.label}
                    </CheckButton>
                {/each}
            </div>
        </section>
    </div>
</Modal>

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

<!-- 评论区抽屉 -->
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
        font-family: var(--reader-font-family, "Times New Roman", Times, serif);
    }

    .float-button {
        z-index: 1000;
        gap: 20px;
        position: fixed;
        bottom: 10%;
        /* right: max(0px, calc((100% - 800px) / 2)); */
        right: calc(max((100% - 800px) / 2 - 80px, 20px));
    }

    @media (max-width: 800px) {
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

    .settings-modal {
        padding: 2rem 1rem;
    }

    .setting-section {
        margin-top: 14px;
    }

    .setting-section p {
        margin: 0 0 8px;
        color: var(--text-secondary);
        font-size: 14px;
    }

    .setting-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
</style>
