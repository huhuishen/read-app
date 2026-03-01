<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { onDestroy, onMount } from "svelte";
    import Button from "$lib/components/Button.svelte";
    import type { Article } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import Editable from "../[id]/write/Editable.svelte";
    import ArticleNavbar from "../[id]/ArticleNavbar.svelte";

    // svelte-ignore state_referenced_locally
    let article: Partial<Article> = $state({
        title: "",
        coverImage: "",
        summary: "",
        categories: [],
        content: "",
    });

    const api = createApi();
    const draftKey = "article:create:draft";
    const autoSaveIntervalMs = 3000;

    let isSubmitting = $state(false);
    let hasHydratedDraft = $state(false);
    let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

    let titleEditor:
        | {
              undo: () => void;
              redo: () => void;
              focus: () => void;
          }
        | undefined = $state();

    let contentEditor:
        | {
              undo: () => void;
              redo: () => void;
              focus: () => void;
          }
        | undefined = $state();

    let canSubmit = $derived(
        !!article.title?.trim() && !!article.content?.trim() && !isSubmitting,
    );
    let titleLength = $derived(article.title?.trim().length ?? 0);
    let contentLength = $derived(article.content?.trim().length ?? 0);

    function normalizedPayload() {
        return {
            title: article.title?.trim(),
            content: article.content?.trim(),
            summary: article.summary?.trim() || undefined,
            coverImage: article.coverImage?.trim() || undefined,
            tags:
                article.tags
                    ?.map((item) => item?.trim())
                    .filter(Boolean) ?? [],
        };
    }

    function saveDraft() {
        if (!browser || !hasHydratedDraft) return;
        localStorage.setItem(draftKey, JSON.stringify(article));
    }

    async function submitArticle() {
        if (isSubmitting) return;

        const payload = normalizedPayload();

        if (!payload.title) {
            toast.show("Title is required", "warn");
            titleEditor?.focus();
            return;
        }

        if (!payload.content) {
            toast.show("Content is required", "warn");
            contentEditor?.focus();
            return;
        }

        isSubmitting = true;

        const res = await safeCall<{ id: string }>(
            api.post("/api/articles", payload),
            toast,
        );

        isSubmitting = false;

        if (!res?.id) return;

        if (browser) {
            localStorage.removeItem(draftKey);
        }

        toast.show("Published", "success");
        goto(`/articles/${res.id}`);
    }

    onMount(() => {
        if (!browser) return;

        const raw = localStorage.getItem(draftKey);

        if (raw) {
            try {
                const draft = JSON.parse(raw) as Partial<Article>;
                article = {
                    ...article,
                    ...draft,
                    tags: draft.tags ?? [],
                };
            } catch {
                localStorage.removeItem(draftKey);
            }
        }

        hasHydratedDraft = true;
        autoSaveTimer = setInterval(saveDraft, autoSaveIntervalMs);
    });

    onDestroy(() => {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
        }

        saveDraft();
    });

    let { data } = $props();
</script>

<svelte:head>
    <title>Create Article</title>
</svelte:head>

<main>
    <ArticleNavbar user={data.user}></ArticleNavbar>
    <div class="content title mb-3">
        <Editable
            variant="title"
            bind:this={titleEditor}
            bind:value={article.title}
            placeholder="Input title..."
        />
    </div>
    <div class="toolbar">
        <div class="history">
            <button
                type="button"
                class="tool-btn"
                onclick={() => contentEditor?.undo()}
            >
                Undo
            </button>
            <button
                type="button"
                class="tool-btn"
                onclick={() => contentEditor?.redo()}
            >
                Redo
            </button>
        </div>
        <div class="meta">
            Title {titleLength} chars, Content {contentLength} chars
        </div>
    </div>

    <Editable bind:this={contentEditor} bind:value={article.content} />

    <div class="footer mb4">
        <Button onclick={submitArticle} disabled={!canSubmit}>
            {isSubmitting ? "Saving..." : "Save"}
        </Button>
    </div>
</main>

<style>
    main {
        background: var(--reader-bg-color);
    }
    .toolbar {
        padding: 0 4rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .history {
        display: flex;
        gap: 0.5rem;
    }

    .tool-btn {
        border: 1px solid var(--border-default);
        background: transparent;
        color: var(--text-primary);
        border-radius: 6px;
        padding: 0.2rem 0.75rem;
        line-height: 1.6;
        cursor: pointer;
    }

    .tool-btn:hover {
        background: var(--surface-soft);
    }

    .meta {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .footer {
        padding: 0 4rem;
    }
</style>
