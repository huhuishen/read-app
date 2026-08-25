<script lang="ts">
    import { page } from "$app/state";
    import { dev } from "$app/environment";
    import { goto } from "$app/navigation";

    const error = $derived(
        page.error as Error & { stack?: string } | undefined,
    );

    const fallback = $derived.by(() => {
        switch (page.status) {
            case 404:
                return "页面不存在";
            case 403:
                return "没有访问权限";
            case 401:
                return "请先登录";
            case 400:
                return "请求参数有误";
            case 503:
                return "服务暂时不可用，请稍后再试";
            default:
                return page.status >= 500
                    ? "服务器开小差了，请稍后再试"
                    : "请求出错";
        }
    });

    const message = $derived(error?.message?.trim() || fallback);

    function goBack() {
        if (history.length > 1) {
            history.back();
        } else {
            goto("/");
        }
    }
</script>

<svelte:head>
    <title>{page.status} - {fallback}</title>
</svelte:head>

<main class="error-page">
    <div class="content">
        <h1 class="status">{page.status}</h1>
        <p class="message">{message}</p>
        <div class="actions">
            <a class="btn primary" href="/">返回首页</a>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <button class="btn" onclick={goBack}>返回上一页</button>
        </div>
        {#if dev && error?.stack}
            <pre class="stack">{error.stack}</pre>
        {/if}
    </div>
</main>

<style>
    .error-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100dvh;
        padding: 2rem;
    }

    .content {
        text-align: center;
        max-width: 480px;
    }

    .status {
        font-size: 96px;
        font-weight: 700;
        line-height: 1;
        margin: 0;
        color: var(--text-faint);
        font-family: "Times New Roman", Times, serif;
    }

    .message {
        font-size: 18px;
        color: var(--text-secondary);
        margin: 1rem 0 2rem;
    }

    .actions {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .btn {
        padding: 8px 20px;
        border: 1px solid var(--border-default);
        border-radius: var(--radius);
        background: var(--control-bg-color);
        color: var(--control-text);
        cursor: pointer;
        font: inherit;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
    }

    .btn:hover {
        border-color: var(--border-strong);
        background-color: var(--surface-soft);
        color: var(--header-color);
    }

    .btn.primary {
        background-color: var(--button-primary);
        color: var(--button-primary-text);
        border-color: var(--button-primary);
    }

    .btn.primary:hover {
        background-color: var(--button-primary-hover);
        border-color: var(--button-primary-hover);
        color: var(--button-primary-text);
    }

    .stack {
        margin-top: 2rem;
        padding: 1rem;
        background: var(--surface-soft);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius);
        font-size: 12px;
        color: var(--text-muted);
        text-align: left;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
    }
</style>
