<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        selected,
        disabled,
        children,
        title,
        onclick,
    }: {
        selected: boolean;
        disabled?: boolean;
        styles?: string;
        title?: string;
        children?: Snippet;
        onclick?: () => void;
    } = $props();

   
</script>

<button
    class="control"
    {disabled}
    class:selected
    {title}
    tabindex={disabled ? -1 : null}
    onclick={() => {
        if (disabled) return;
        onclick?.();
    }}
    >{@render children?.()}
</button>

<style>
    .control {
        display: inline-flex;
        align-items: center;
        gap: 6px;

        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid var(--control-bg-hover);
        /* border: none; */
        background: transparent;

        /* font-size: 14px; */
        cursor: pointer;
        user-select: none;

        color: var(--control-text);

        /* transition:
            background-color 0.15s ease,
            color 0.15s ease,
            box-shadow 0.15s ease; */
    }

    .control:hover:not(.disabled) {
        background: var(--control-bg-hover);
        /* border: 1px solid var(--control-bg-hover); */
        /* color: var(--highlight-color); */
    }

    .control.selected {
        background: var(--control-bg-selected);
        border: 1px solid var(--control-border-selected);
        color: var(--highlight-color);
        /* box-shadow: inset 0 0 0 1px var(--control-border-selected); */
    }
</style>
