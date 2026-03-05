<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import TagsManager from "$lib/components/Tags.svelte";
    import type { Article } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import { onDestroy, onMount } from "svelte";
    import EditableInput from "./EditableInput.svelte";
    import EditableTextArea from "./EditableTextArea.svelte";
    import Debug from "$lib/components/Debug.svelte";

    type EditorHandle = {
        undo: () => void;
        redo: () => void;
        focus: () => void;
    };

    let {
        mode,
        initialArticle,
    }: {
        mode: "create" | "edit" | "review";
        initialArticle?: Partial<Article>;
    } = $props();

    const api = createApi();
    const autoSaveIntervalMs = 3000;

    const draftKey = $derived.by(() =>
        mode === "create"
            ? "article:create:draft"
            : mode === "review"
              ? `article:review:${initialArticle?.id ?? "unknown"}:draft`
              : `article:edit:${initialArticle?.id ?? "unknown"}:draft`,
    );

    function createInitialArticle() {
        const tags = initialArticle?.tags ?? [];
        return {
            title: "",
            content: "",
            summary: "",
            coverImage: "",
            ...initialArticle,
            tags,
        } satisfies Partial<Article>;
    }

    let article: Partial<Article> = $state(createInitialArticle());

    let isSubmitting = $state(false);
    let isDeleting = $state(false);
    let isRejecting = $state(false);
    let isUploading = $state(false);
    let hasHydratedDraft = $state(false);
    let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

    let titleEditor: EditorHandle | undefined = $state();
    let contentEditor: EditorHandle | undefined = $state();

    const canSubmit = $derived(
        mode !== "review" &&
            !!article.title?.trim() &&
            !!article.content?.trim() &&
            !isSubmitting,
    );
    const canDelete = $derived(
        mode === "edit" && !!article.id && !isSubmitting && !isDeleting,
    );
    const canReject = $derived(
        mode === "review" &&
            article.status === "待审核" &&
            !!article.id &&
            !isSubmitting &&
            !isRejecting,
    );
    const canApprove = $derived(
        mode === "review" &&
            (article.status === "待审核" || article.status === "下架") &&
            !!article.id &&
            !isSubmitting,
    );
    const canSubmitForReview = $derived(
        mode === "edit" &&
            !!article.id &&
            !!article.title?.trim() &&
            !!article.content?.trim() &&
            !isSubmitting &&
            (article.status === "草稿" || article.status === "下架"),
    );
    const canTakeDown = $derived(
        (mode === "edit" || mode === "review") &&
            !!article.id &&
            article.status === "上架" &&
            !isSubmitting,
    );

    function normalizedPayload() {
        return {
            title: article.title?.trim(),
            content: article.content?.trim(),
            summary: article.summary?.trim() || undefined,
            coverImage: article.coverImage?.trim() || undefined,
            tags:
                article.tags?.map((item) => item?.trim()).filter(Boolean) ?? [],
        };
    }

    function saveDraft() {
        if (!browser || !hasHydratedDraft) return;
        localStorage.setItem(draftKey, JSON.stringify(article));
    }

    async function submitArticle() {
        if (isSubmitting) return;
        const payload = normalizedPayload();

        if (mode !== "review") {
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
        }

        isSubmitting = true;

        if (mode === "create") {
            const res = await safeCall<{ id: string }>(
                api.post("/api/articles", payload),
                toast,
            );
            isSubmitting = false;
            if (!res?.id) return;

            if (browser) {
                localStorage.removeItem(draftKey);
            }

            toast.show("创建成功", "success");
            goto(`/articles/${res.id}`);
            return;
        }

        const id = article.id;
        if (!id) {
            isSubmitting = false;
            toast.show("Missing article id", "error");
            return;
        }

        const res = await safeCall(
            api.post(
                `/api/articles/${id}`,
                mode === "review" ? { ...payload, status: "上架" } : payload,
            ),
            toast,
        );
        isSubmitting = false;

        if (!res) return;

        if (browser) {
            localStorage.removeItem(draftKey);
        }

        toast.show(
            mode === "review" ? "审核通过，已上架" : "已保存",
            "success",
        );
        goto(mode === "review" ? `/articles/${id}/summary` : `/articles/${id}`);
    }

    async function rejectArticle() {
        if (mode !== "review" || isRejecting) return;

        const id = article.id;
        if (!id) {
            toast.show("Missing article id", "error");
            return;
        }

        isRejecting = true;
        const payload = normalizedPayload();
        const res = await safeCall(
            api.post(`/api/articles/${id}`, { ...payload, status: "草稿" }),
            toast,
        );
        isRejecting = false;

        if (!res) return;

        if (browser) {
            localStorage.removeItem(draftKey);
        }

        article.status = "草稿";
        toast.show("已退回草稿", "success");
        goto(`/articles/${id}/summary`);
    }

    async function submitForReview() {
        if (mode !== "edit" || isSubmitting) return;

        const id = article.id;
        const payload = normalizedPayload();
        if (!id || !payload.title || !payload.content) {
            toast.show("请先完善标题和内容", "warn");
            return;
        }

        isSubmitting = true;
        const res = await safeCall(
            api.post(`/api/articles/${id}`, { ...payload, status: "待审核" }),
            toast,
        );
        isSubmitting = false;

        if (!res) return;
        article.status = "待审核";
        toast.show("投稿成功，等待审核", "success");
        goto(`/articles/${id}/summary`);
    }

    async function takeDownArticle() {
        if (isSubmitting) return;
        const id = article.id;
        if (!id) {
            toast.show("Missing article id", "error");
            return;
        }

        isSubmitting = true;
        const res = await safeCall(
            api.post(`/api/articles/${id}`, { status: "下架" }),
            toast,
        );
        isSubmitting = false;

        if (!res) return;
        article.status = "下架";
        toast.show("已下架", "success");
        goto(`/articles/${id}/summary`);
    }

    async function deleteArticle() {
        if (mode !== "edit" || isDeleting) return;

        const id = article.id;
        if (!id) {
            toast.show("Missing article id", "error");
            return;
        }

        if (browser) {
            const ok = window.confirm("确认要删除这篇文章吗？删除后不可恢复。");
            if (!ok) return;
        }

        isDeleting = true;
        const res = await safeCall(api.delete(`/api/articles/${id}`), toast);
        isDeleting = false;

        if (!res) return;

        if (browser) {
            localStorage.removeItem(draftKey);
        }

        toast.show("Deleted", "success");
        goto("/");
    }

    async function uploadCover(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        if (!file || isUploading) return;

        isUploading = true;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/uploads/image", {
                method: "POST",
                body: formData,
            });

            const body = await response.json();
            if (!response.ok || !body?.url) {
                throw new Error(body?.message ?? "Upload failed");
            }

            article.coverImage = body.url;
            toast.show("Cover uploaded", "success");
        } catch (error: any) {
            toast.show(error?.message ?? "Upload failed", "error");
        } finally {
            isUploading = false;
            input.value = "";
        }
    }

    onMount(() => {
        if (!browser) return;

        // const raw = localStorage.getItem(draftKey);
        // if (raw) {
        //     try {
        //         const draft = JSON.parse(raw) as Partial<Article>;
        //         article = {
        //             ...article,
        //             ...draft,
        //             tags: draft.tags ?? article.tags ?? [],
        //         };
        //     } catch {
        //         localStorage.removeItem(draftKey);
        //     }
        // }

        // hasHydratedDraft = true;
        // autoSaveTimer = setInterval(saveDraft, autoSaveIntervalMs);
    });

    onDestroy(() => {
        if (autoSaveTimer) clearInterval(autoSaveTimer);
        saveDraft();
    });
</script>

<!-- <Debug variable={{ mode, canTakeDown, isSubmitting, article }}></Debug> -->
<div class="editor-container">
    <div class="main-column">
        <EditableInput
            bind:this={titleEditor}
            bind:value={article.title}
            disabled={mode === "review"}
        />
        <EditableTextArea
            bind:this={contentEditor}
            bind:value={article.content}
            disabled={mode === "review"}
        />
    </div>

    <aside class="side flex g-3">
        <div class="section-title">封面图</div>
        {#if article.coverImage}
            <img
                src={article.coverImage}
                alt="封面图预览"
                class="cover-preview"
            />
        {/if}
        <input
            class="cover-input"
            type="text"
            bind:value={article.coverImage}
            placeholder="封面图 URL"
        />
        <label class="upload-btn">
            {isUploading ? "正在上传..." : "上传封面"}
            <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onchange={uploadCover}
                disabled={isUploading}
            />
        </label>

        <div class="section-title">导读</div>
        <textarea
            class="summary-input"
            bind:value={article.summary}
            placeholder="填写导读..."
        ></textarea>

        <div class="section-title">标签</div>
        <TagsManager bind:tags={article.tags} />

        <div class="flex sb footer">
            <Button
                variant="primary"
                onclick={submitArticle}
                disabled={mode === "review" ? !canApprove : !canSubmit}
            >
                {mode === "review"
                    ? isSubmitting
                        ? "发布中..."
                        : "上架"
                    : isSubmitting
                      ? "保存中..."
                      : "保存"}
            </Button>
            {#if mode === "edit"}
                <Button
                    variant="primary"
                    onclick={submitForReview}
                    disabled={!canSubmitForReview}
                >
                    投稿
                </Button>
                <Button
                    onclick={takeDownArticle}
                    disabled={!canTakeDown}
                >
                    下架
                </Button>
                <Button
                    variant="danger"
                    onclick={deleteArticle}
                    disabled={!canDelete}
                >
                    {isDeleting ? "删除中..." : "删除"}
                </Button>
            {:else if mode === "review"}
                <Button
                    onclick={takeDownArticle}
                    disabled={!canTakeDown}
                >
                    下架
                </Button>
                <Button
                    variant="danger"
                    onclick={rejectArticle}
                    disabled={!canReject}
                >
                    {isRejecting ? "处理中..." : "撤稿"}
                </Button>
            {/if}
        </div>
    </aside>
</div>

<style>
    .editor-container {
        position: relative;
    }

    .main-column {
        min-height: 100vh;
        border-bottom: 1px solid var(--border-soft);
        padding-bottom: 5rem;
        margin-bottom: 5rem;
    }

    .footer {
        margin: 3em 0;
        gap: 12px;
        width: 100%;
    }

    .side {
        position: absolute;
        top: 0;
        left: calc(50% + 410px);
        height: fit-content;
        width: 300px;
        background: var(--main-bg-color);
        padding: 1rem;
    }

    .section-title {
        font-size: 14px;
        color: var(--text-secondary);
    }

    .cover-preview {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border: 1px solid var(--border-default);
    }

    .cover-input,
    .summary-input {
        width: 100%;
        border: 1px solid var(--border-default);
        background: var(--main-bg-color);
        color: var(--text-primary);
        padding: 8px;
        outline: none;
    }

    .summary-input {
        min-height: 100px;
        resize: vertical;
    }

    .upload-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        border: 1px dashed var(--border-default);
        color: var(--text-secondary);
        cursor: pointer;
        padding: 8px;
    }

    .upload-btn input {
        display: none;
    }

    @media (max-width: 1420px) {
        .side {
            position: static;
            width: 100%;
            margin-top: 20px;
        }
    }
</style>
