<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        tabs,
        active = $bindable(),
        children,
        onclick,
        enableSwipe = false,
    }: {
        tabs: { key: string; label: string }[];
        active: string;
        children: Snippet;
        onclick?: (active: string) => void;
        enableSwipe?: boolean;
    } = $props();

    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 60;
    const VERTICAL_TOLERANCE = 40;

    const selectTab = (key: string) => {
        active = key;
        onclick?.(active);
    };

    const onTouchStart = (event: TouchEvent) => {
        if (!enableSwipe || event.touches.length !== 1) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
        if (!enableSwipe || event.changedTouches.length !== 1) return;

        const deltaX = event.changedTouches[0].clientX - touchStartX;
        const deltaY = event.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (Math.abs(deltaY) > VERTICAL_TOLERANCE) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

        const currentIndex = tabs.findIndex((tab) => tab.key === active);
        if (currentIndex === -1) return;

        if (deltaX < 0 && currentIndex < tabs.length - 1) {
            selectTab(tabs[currentIndex + 1].key);
        } else if (deltaX > 0 && currentIndex > 0) {
            selectTab(tabs[currentIndex - 1].key);
        }
    };

    const onTouchCancel = () => {
        touchStartX = 0;
        touchStartY = 0;
    };
</script>

<div class="tabs">
    <div class="tabs-center">
        {#each tabs as tab}
            <button
                class:selected={active === tab.key}
                onclick={() => {
                    selectTab(tab.key);
                }}
            >
                {tab.label}
            </button>
        {/each}
    </div>
</div>

<div
    class="tab-content"
    ontouchstart={onTouchStart}
    ontouchend={onTouchEnd}
    ontouchcancel={onTouchCancel}
>
    {@render children()}
</div>

<style>
    .tabs {
        position: sticky;
        top: 0px;
        display: flex;
        justify-content: center;
        gap: 24px;
        /* border-bottom: 1px solid var(--border-soft); */
        font-size: 18px;
        background-color: var(--surface-ghost);
        /* background: color-mix(in srgb, var(--surface-reader) 88%, var(--surface-page) 12%); */
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px); /* 兼容 Safari */
        border-bottom: 1px solid var(--border-soft);

        height: 50px;
        min-width: 400px;
        z-index: 100;
    }
    .tabs-center {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
    }
    .tabs button {
        height: 100%;
        background: none;
        border: none;
        padding: 0.5rem;
        color: var(--text-secondary);
        cursor: pointer;
    }

    .tabs button.selected {
        color: var(--text-primary);
        border-bottom: 2px solid var(--text-primary);
        border-radius: 0;
    }

    .tab-content {
        padding: 1rem;
        min-height: calc(100vh - 60px);
        background: var(--main-bg-color);
        min-width: 400px;
    }
</style>
