<script lang="ts">
    import Overlay from "$lib/components/overlay/Overlay.svelte";
    import type { Snippet } from "svelte";
    import { trapFocus } from "../util";
    import { fly, slide } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    let {
        show = $bindable(),
        children,
        clickClose = true,
        size = "md",
        placement = "right",
    }: {
        show: boolean;
        children?: Snippet;
        clickClose?: boolean;
        size?: "sm" | "md" | "lg" | "full";
        placement?: "left" | "right" | "top" | "bottom";
    } = $props();

    let drawerEl: HTMLElement | null = null;
    let previousFocus: Element | null = null;
    let cleanupTrap: (() => void) | null = null;

    function closeDrawer() {
        show = false;
    }

    $effect(() => {
        previousFocus = document.activeElement;

        if (!show) return;
        // 1. focus trap
        if (drawerEl) cleanupTrap = trapFocus(drawerEl);

        queueMicrotask(() => {
            drawerEl?.focus();
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
        bind:this={drawerEl}
        class="drawer drawer-{placement} drawer-{size}"
        in:fly={{ x: 400, duration: 100 }}
        out:fly={{ x: 400, duration: 200 }}
    >
        <!-- <button
            class="drawer-close"
            aria-label="Close drawer"
            onclick={closeDrawer}
        >
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button> -->
        <div class="drawer-body">
            {@render children?.()}
        </div>
    </div>
</Overlay>

<style>
    .drawer {
        position: fixed;
        top: 0;
        height: 100vh;
        background: #fff;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        z-index: 2100;
        /* transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform; */
        width: 100%;
    }
    .drawer-sm {
        max-width: 360px;
    }
    .drawer-md {
        max-width: 560px;
    }
    .drawer-lg {
        max-width: 860px;
    }

    .drawer-full {
        width: 100vw;
        height: 100vh;
        max-height: none;
        margin: 0;
        border-radius: 0;
    }
    .drawer-left {
        left: 0;
    }
    .drawer-right {
        right: 0;
    }

    .drawer-body {
        width: 100%;
        overflow-y: auto;
        flex: 1;
        background-color: var(--reader-bg-color);
        color: var(--text-color);
    }
    .drawer-top {
        top: 0;
        left: 0;
        width: 100%;
        height: 300px;
    }

    .drawer-bottom {
        bottom: 0;
        left: 0;
        width: 100%;
        height: 300px;
    }

    .drawer-close {
        position: absolute;
        top: 12px;
        right: 12px;
        border: none;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .drawer-close:hover {
        background: rgba(0, 0, 0, 0.5);
    }
</style>
