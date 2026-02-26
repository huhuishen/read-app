<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        disabled = false,
        variant,
        styles,
        children,
        onclick,
    }: {
        disabled?: boolean;
        variant?: "primary" | "danger" | "light" | "link";
        styles?: string;
        children?: Snippet;
        onclick?: () => void;
    } = $props();
</script>

<button
    data-variant={variant}
    class={styles}
    {disabled}
    tabindex={disabled ? -1 : null}
    onclick={() => {
        if (disabled) return;
        onclick?.();
    }}
    >{@render children?.()}
</button>
