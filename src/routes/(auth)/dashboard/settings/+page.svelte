<script lang="ts">
    import { onMount } from "svelte";
    import Button from "$lib/components/Button.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import AdminTabs from "../AdminTabs.svelte";

    const { data } = $props<{ data: { autoPublishWithoutReview: boolean } }>();

    const api = createApi();
    let autoPublishWithoutReview = $state(false);
    let isSaving = $state(false);

    onMount(() => {
        autoPublishWithoutReview = !!data.autoPublishWithoutReview;
    });

    async function saveSettings() {
        if (isSaving) return;
        isSaving = true;

        const res = await safeCall<{ autoPublishWithoutReview: boolean }>(
            api.post("/api/settings/publish", {
                autoPublishWithoutReview,
            }),
            toast,
        );

        isSaving = false;
        if (!res) return;

        autoPublishWithoutReview = !!res.autoPublishWithoutReview;
        toast.show("设置已保存", "success");
    }
</script>

<svelte:head>
    <title>发布设置</title>
</svelte:head>

<div class="settings-page">
    <section class="settings-card">
        <h2>文章发布设置</h2>

        <label class="option">
            <input type="checkbox" bind:checked={autoPublishWithoutReview} />
            <span>发表文章时跳过编辑审核，直接发布</span>
        </label>

        <p class="hint">
            开启后，你提交文章时将直接进入 <code>上架</code>
            状态；关闭后，文章会先进入
            <code>待审核</code> 等待审核。
        </p>

        <Button variant="primary" onclick={saveSettings} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存设置"}
        </Button>
    </section>
</div>

<style>
    .settings-page {
        padding: 1rem;
        min-height: 100vh;
    }
    .settings-card {
        max-width: 680px;
        margin: 1.25rem 0;
        padding: 1rem 1.25rem;
        border: 1px solid var(--border-default);
        background: var(--surface-modal);
    }

    h2 {
        margin: 0 0 1rem 0;
        font-size: 1.05rem;
    }

    .option {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin: 0 0 0.6rem 0;
        font-size: 0.95rem;
    }

    .hint {
        margin: 0 0 1rem 0;
        font-size: 0.82rem;
        color: var(--text-muted);
        line-height: 1.6;
    }
</style>
