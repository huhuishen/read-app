<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { onDestroy, onMount } from "svelte";
    import Button from "$lib/components/Button.svelte";
    import Editor from "$lib/components/Editor.svelte";
    import type { Article } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";

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
            categories:
                article.categories
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

        if (!payload.title || !payload.content) {
            toast.show("请先填写标题和正文", "error");
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

        toast.show("发表成功！", "success");
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
                    categories: draft.categories ?? [],
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
</script>

<svelte:head>
    <title>发表</title>
</svelte:head>

<main>
    <Editor bind:article></Editor>

    <div class="footer">
        <div class="tips">
            <span>标题：{titleLength} 字</span>
            <span>正文：{contentLength} 字</span>
        </div>

        <Button onclick={submitArticle} disabled={!canSubmit}>
            {isSubmitting ? "保存中..." : "保存"}
        </Button>
    </div>
</main>

<style>
    .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0 4rem;
        margin-bottom: 2rem;
    }

    .tips {
        display: flex;
        gap: 1rem;
        color: var(--muted-color, #666);
        font-size: 0.875rem;
    }
</style>
