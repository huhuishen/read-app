<script lang="ts">
    import type { Snippet } from "svelte";
    import Icon from "./Icon.svelte";
    import { goto } from "$app/navigation";

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
    <button
        class="home"
        onclick={() => {
            goto("/");
        }}><Icon name="home" size={20} /></button
    >
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
        border-bottom: 1px solid #eee;
        font-size: 18px;
        background: white;
        height: 50px;
        z-index: 100;
    }
    .home {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
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
        color: #666;
        cursor: pointer;
    }

    .tabs button.selected {
        color: #111;
        border-bottom: 2px solid #111;
    }

    .tab-content {
        padding: 1rem;
        min-height: calc(100vh - 60px);
        background-color: white;
    }
</style>
