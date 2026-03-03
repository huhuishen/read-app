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
        /* border: 1px solid var(--button-primary); */
        /* border: none; */

        /* font-size: 14px; */
        cursor: pointer;
        user-select: none;

        background: transparent;
        color: var(--text-faint);

        /* transition:
            background-color 0.15s ease,
            color 0.15s ease,
            box-shadow 0.15s ease; */
    }

    .control:disabled {
        cursor: not-allowed;
    }

    .control:hover:not(.disabled) {
        background-color: var(--button-primary-hover);
        border-color: var(--button-primary-hover);
        color: var(--button-primary-text);
    }

    .control.selected {
        background: var(--button-primary);
        border: 1px solid var(--button-primary);
        color: var(--button-primary-text);
        /* box-shadow: inset 0 0 0 1px var(--control-border-selected); */
    }
</style>
