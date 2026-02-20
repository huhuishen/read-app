<script lang="ts">
    import Overlay from "$lib/components/overlay/Overlay.svelte";
    import type { Snippet } from "svelte";
    import { tick } from "svelte";

    let {
        show = $bindable(),
        children,
        clickClose = true,
        size = "md",
        anchor = null,
        placement = "center",
    }: {
        show: boolean;
        children?: Snippet;
        clickClose?: boolean;
        size?: "sm" | "md" | "lg" | "full";
        anchor: HTMLElement | null;
        placement?: "left" | "right" | "top" | "bottom" | "center";
    } = $props();

    let modalEl: HTMLDivElement | null = null;
    let previousFocus: Element | null = null;
    let cleanupTrap: (() => void) | null = null;

    async function updatePosition() {
        if (!modalEl) return;

        await tick();
        const modalRect = modalEl.getBoundingClientRect();

        if (!anchor) {
            // ===== 无 anchor 时居中 =====
            const top =
                (window.innerHeight - modalRect.height) / 2 + window.scrollY;
            const left =
                (window.innerWidth - modalRect.width) / 2 + window.scrollX;
            modalEl.style.top = `${top}px`;
            modalEl.style.left = `${left}px`;
            placement = "center";
            return;
        }

        const rect = anchor.getBoundingClientRect();

        const gap = 10;
        const padding = 30;

        let top = rect.top;
        let left = rect.right + gap;
        placement = "right";

        // ===== 优先右侧 =====
        if (rect.right + gap + modalRect.width <= window.innerWidth) {
            left = rect.right + gap;
            placement = "right";
        }
        // ===== 左侧 =====
        else if (rect.left - gap - modalRect.width >= 0) {
            left = rect.left - modalRect.width - gap;
            placement = "left";
        }
        // ===== 下方 =====
        else if (rect.bottom + gap + modalRect.height <= window.innerHeight) {
            top = rect.bottom + gap;
            left = rect.left;
            placement = "bottom";
        }
        // ===== 上方 =====
        else {
            top = Math.max(gap, rect.top - modalRect.height - gap);
            left = rect.left;
            placement = "top";
        }

        // 垂直避让（左右弹出时）
        if (placement === "left" || placement === "right") {
            if (top + modalRect.height > window.innerHeight - padding) {
                top = window.innerHeight - modalRect.height - padding;
            }
            if (top < padding) {
                top = 10;
            }
        }

        // 水平避让（上下弹出时）
        if (placement === "top" || placement === "bottom") {
            if (left + modalRect.width > window.innerWidth - padding) {
                left = window.innerWidth - modalRect.width - padding;
            }
            if (left < padding) {
                left = padding;
            }
        }

        modalEl.style.top = `${top + window.scrollY}px`;
        modalEl.style.left = `${left + window.scrollX}px`;

        // ===== 动态设置箭头偏移 =====
        const arrowEl = modalEl.querySelector(".arrow") as HTMLElement;
        if (arrowEl) {
            if (placement === "left" || placement === "right") {
                // 箭头垂直居中 anchor
                const arrowOffset = rect.top + rect.height / 2 - top;
                arrowEl.style.top = `${arrowOffset}px`;
            } else if (placement === "top" || placement === "bottom") {
                // 箭头水平居中 anchor
                const arrowOffset = rect.left + rect.width / 2 - left;
                arrowEl.style.left = `${arrowOffset}px`;
            }
        }
    }

    $effect(() => {
        if (show && modalEl) {
            const observer = new ResizeObserver(() => updatePosition());
            observer.observe(modalEl);
        }
    });

    function handleReposition() {
        if (show) updatePosition();
    }
</script>

<svelte:window onresize={handleReposition} onscroll={handleReposition} />

<Overlay bind:show {clickClose}>
    <div
        bind:this={modalEl}
        class="modal-content size-{size} {placement}"
        role="dialog"
        aria-modal="true"
        tabindex="0"
    >
        <div class="arrow"></div>
        <div class="popper-content">
            {@render children?.()}
        </div>
    </div>
</Overlay>

<style>
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

    .modal-content {
        position: absolute; /* 关键 */
        top: 0;
        left: 0;
        min-width: 220px;
        max-height: 90vh;
        background: white;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
        z-index: 2100;
        overflow: visible;
        width: 90%;
    }
    .popper-content {
        max-height: 90vh;
        overflow-y: auto; /* 真正滚动在这里 */
    }
    /* 箭头基础 */
    .arrow {
        position: absolute;
        width: 0;
        height: 0;
    }

    /* ===== 右侧弹出 → 箭头在左 ===== */
    .right .arrow {
        left: -8px;
        top: 20px;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-right: 8px solid white;
    }

    /* ===== 左侧弹出 → 箭头在右 ===== */
    .left .arrow {
        right: -8px;
        top: 20px;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-left: 8px solid white;
    }

    /* ===== 下方弹出 → 箭头在上 ===== */
    .bottom .arrow {
        top: -8px;
        left: 20px;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid white;
    }

    /* ===== 上方弹出 → 箭头在下 ===== */
    .top .arrow {
        bottom: -8px;
        left: 20px;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid white;
    }

    .center {
        top: 50%;
        left: 50%;
        /* transform: translate(-50%, -50%); */
    }

    .center .arrow {
        display: none;
    }
</style>
