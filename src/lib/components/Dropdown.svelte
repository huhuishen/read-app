<script lang="ts">
    import { type Snippet } from "svelte";

    export interface DropdownProps {
        open?: boolean;
        align?: "left" | "right";
        children?: Snippet;
        items: {
            name: string;
            className?: string;
            onclick?: (row: any) => void;
            disabled?: (row: any) => boolean;
        }[];
    }

    let {
        open = $bindable(),
        align = "right",
        children,
        items,
    }: DropdownProps = $props();

    function toggle() {
        open = !open;
    }

    let rootEl: HTMLElement | null = null;

    function onDocumentClick(e: MouseEvent) {
        if (!rootEl?.contains(e.target as Node)) {
            open = false;
        }
    }
</script>

<svelte:document onmousedown={onDocumentClick} />

<div class="dropdown" bind:this={rootEl} data-open={open}>
    <!-- Trigger -->
    <button
        class="dropdown-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onclick={(e) => {
            e.stopPropagation();
            toggle();
        }}
    >
        {@render children?.()}
    </button>

    {#if open}
        <div class="dropdown-menu {align}" role="menu">
            {#each items as item}
                {#if item.name}
                    <button
                        class={item.className}
                        disabled={item.disabled?.(item)}
                        onclick={() => {
                            open = false;
                            item.onclick?.(item);
                        }}>{item.name}</button
                    >
                {:else}
                    <hr />
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
    .dropdown {
        position: relative;
        display: inline-block;
        /* z-index: 2000; */
    }

    .dropdown-trigger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        /* border-radius: 8px;
        border: 1px solid #e5e7eb;
        background: #fff; */
        background-color: transparent;
        cursor: pointer;
        user-select: none;
        border: none;
        outline: none;
    }

    .dropdown-menu {
        position: absolute;
        top: calc(100% + 1px);
        min-width: 160px;
        padding: 6px;
        border-radius: 6px;
        background: #fff;
        border: 1px solid #e5e7eb;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }

    .dropdown-menu.right {
        right: 0;
    }

    .dropdown-menu.left {
        left: 0;
    }

    .dropdown-menu button {
        display: inline;
        width: 100%;
        padding: 8px 12px;
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
    }

    .dropdown-menu button:hover:not(:disabled) {
        background-color: #f3f4f6;
    }
</style>
