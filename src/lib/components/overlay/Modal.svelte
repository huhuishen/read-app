<script lang="ts">
    import Overlay from "$lib/components/overlay/Overlay.svelte";
    import type { Snippet } from "svelte";
    import Icon from "../Icon.svelte";
    import { trapFocus } from "../util";

    let {
        show = $bindable(),
        children,
        clickClose = true,
        size = "md",
    }: {
        show: boolean;
        children?: Snippet;
        clickClose?: boolean;
        size?: "sm" | "md" | "lg" | "full";
    } = $props();

    let modalEl: HTMLDivElement | null = null;
    let previousFocus: Element | null = null;
    let cleanupTrap: (() => void) | null = null;

    // 焦点管理（组件库级必备）
    $effect(() => {
        previousFocus = document.activeElement;

        if (!show) return;
        // 1. focus trap
        if (modalEl) cleanupTrap = trapFocus(modalEl);

        queueMicrotask(() => {
            modalEl?.focus();
        });

        return () => {
            cleanupTrap?.();
            if (previousFocus instanceof HTMLElement) {
                previousFocus.focus();
            }
        };
    });


</script>

<Overlay bind:show {clickClose}>
    <div
        bind:this={modalEl}
        class="modal-content size-{size}"
        role="dialog"
        aria-modal="true"
        tabindex="0"
    >
        {#if size === "full"}
            <button
                class="modal-close"
                aria-label="Close modal"
                onclick={() => {
                    show = false;
                }}
            >
                <Icon name="cross" size={16} strokeWidth={1} />
            </button>
        {/if}
        {@render children?.()}
    </div>
</Overlay>

<style>
    .modal-content {
        background-color: #fff;
        border-radius: 3px;

        /* padding: 16px 18px;
        margin: 12px; */

        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.12),
            0 4px 10px rgba(0, 0, 0, 0.08);

        z-index: 2100;
        outline: none;
        width: 100%;
    }

    /* 尺寸控制（非常实用） */
    .size-sm {
        max-width: 360px;
    }
    .size-md {
        max-width: 560px;
    }
    .size-lg {
        max-width: 860px;
    }

    .size-full {
        width: 100vw;
        height: 100vh;
        max-height: none;
        margin: 0;
        border-radius: 0;
    }

    /* 默认全屏关闭按钮 */
    .modal-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 24px;
        height: 24px;
        border: none;
        background: rgba(0, 0, 0, 0.05);
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
    }
    .modal-close:hover {
        background: rgba(0, 0, 0, 0.2);
    }
</style>
