<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { onMount } from "svelte";

    type Action = {
        label: string;
        icon?: string;
        disabled?: () => boolean;
        onclick: () => void;
    };

    let {
        actions,
    }: {
        actions: Action[];
    } = $props();

    let visible = $state(false);
    let enabled = $state(false);

    const MIN_WIDTH = 768;
    const EDGE_HEIGHT = 120;

    function updateEnabled() {
        enabled = window.innerWidth < MIN_WIDTH;
        if (!enabled) visible = false;
    }

    function show() {
        if (!enabled) return;
        visible = true;
    }

    function hide() {
        visible = false;
    }

    /**
     * 全局 pointerdown：
     * - 如果点击发生在文本选择过程中（非热区），临时禁用热区
     * - 只有当一次 pointerdown 明确发生在热区时，才重新启用
     */
    function onPointerDown(e: PointerEvent) {
        if (!enabled) return;

        const y = e.clientY;
        const viewportHeight = window.innerHeight;
        const inEdge = y >= viewportHeight - EDGE_HEIGHT;

        // 如果 pointerdown 不在热区，说明用户是在进行正常交互（如选字）
        // 此时彻底移除热区，避免干扰后续 selection
        if (!inEdge) {
            if (visible) {
                hide();
            }
            enabled = false;
            return;
        }

        // pointerdown 明确发生在热区，重新启用
        enabled = true;
        e.preventDefault();
    }

    function onPointerUp() {
        // pointer 结束后，根据 viewport 再次计算是否应启用热区
        updateEnabled();
    }

    onMount(() => {
        updateEnabled();
    });
</script>

<svelte:document onpointerdown={onPointerDown} onpointerup={onPointerUp} />
<svelte:window onresize={updateEnabled} />

{#if visible}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
        class="backdrop"
        onclick={hide}
        aria-label="隐藏底部工具栏"
        role="button"
    ></div>
{/if}

{#if enabled}
    {#if !visible}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div
            class="edge-hit"
            onclick={show}
            aria-label="显示底部工具栏"
            role="button"
        ></div>
    {/if}
    <div class="toolbar" class:show={visible}>
        {#each actions as action}
            <button
                class="action"
                disabled={action.disabled?.()}
                onclick={() => {
                    hide();
                    action.onclick?.();
                }}
                tabindex="-1"
            >
                {#if action.icon}<Icon name={action.icon} size={20}></Icon>{/if}
                <span>{action.label}</span>
            </button>
        {/each}
    </div>
{/if}

<style>
    .edge-hit {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        height: 80px;
        z-index: 5;
        background: transparent;
        user-select: none;
        touch-action: manipulation;
    }

    .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.05);
        z-index: 9;
    }

    .toolbar {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        height: 80px;
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem;
        background: var(--panel-bg, #fff);
        border-top: 1px solid #ddd;
        transform: translateY(100%);
        transition: transform 0.1s ease;
        box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.08);
        z-index: 10;
    }

    .toolbar.show {
        transform: translateY(0);
    }

    .action {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        /* padding: 1em; */
        border: none;
        color: #333;
    }
    .action span {
        font-size: 13px;
        color: #777;
    }
</style>
