<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        tabs,
        active = $bindable(),
        children,
        onclick,
    }: {
        tabs: { key: string; label: string }[];
        active: string;
        children: Snippet;
        onclick?: (active: string) => void;
    } = $props();
</script>

<div class="tabs">
    <div class="tabs-center">
        {#each tabs as tab}
            <button
                class:selected={active === tab.key}
                onclick={() => {
                    active = tab.key;
                    onclick?.(active);
                }}
            >
                {tab.label}
            </button>
        {/each}
    </div>
</div>

<div class="tab-content">
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

        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px); /* 兼容 Safari */
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);

        height: 50px;
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
    }

    .tab-content {
        padding: 1rem;
        min-height: calc(100vh - 60px);
        background: var(--main-bg-color);
    }
</style>
