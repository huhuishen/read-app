<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import type { Article } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import type { PageProps } from "./$types";
    import Editable from "./Editable.svelte";

    const { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    let article: Partial<Article> = $state(data.article);
    const api = createApi();

    let contentEditor:
        | {
              undo: () => void;
              redo: () => void;
              focus: () => void;
          }
        | undefined = $state();

    let titleEditor:
        | {
              undo: () => void;
              redo: () => void;
              focus: () => void;
          }
        | undefined = $state();

    let isSaving = $state(false);

    const titleLength = $derived((article.title ?? "").length);
    const contentLength = $derived((article.content ?? "").length);

    const canSubmit = $derived(
        !isSaving &&
            (article.title ?? "").trim().length > 0 &&
            (article.content ?? "").trim().length > 0,
    );

    async function handleSubmit() {
        const title = (article.title ?? "").trim();
        const content = article.content ?? "";

        if (!title) {
            toast.show("Title is required", "warn");
            titleEditor?.focus();
            return;
        }

        if (!content.trim()) {
            toast.show("Content is required", "warn");
            contentEditor?.focus();
            return;
        }

        isSaving = true;

        const payload = {
            ...article,
            title,
            content,
        };

        const r = await safeCall(
            api.post(`/api/articles/${article.id}`, payload),
            toast,
        );

        isSaving = false;

        if (r) {
            toast.show("Saved", "success");
            goto(`/articles/${data.article.id}`);
        }
    }
</script>

<svelte:head>
    <title>{article.title} - Edit</title>
</svelte:head>

<Editable
    variant="title"
    bind:this={titleEditor}
    bind:value={article.title}
    placeholder="Input title..."
/>

<div class="toolbar">
    <div class="history">
        <button type="button" class="tool-btn" onclick={() => contentEditor?.undo()}>
            Undo
        </button>
        <button type="button" class="tool-btn" onclick={() => contentEditor?.redo()}>
            Redo
        </button>
    </div>
    <div class="meta">Title {titleLength} chars, Content {contentLength} chars</div>
</div>

<Editable bind:this={contentEditor} bind:value={article.content} />

<div class="footer mb4">
    <Button onclick={handleSubmit} disabled={!canSubmit}>
        {isSaving ? "Saving..." : "Save"}
    </Button>
</div>

<style>
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
