<script lang="ts">
    let {
        disabled = false,
        children = null,
        title = "",
        onclick = null,
    } = $props();
</script>

<button
    class="flex control"
    class:disabled
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
        top: 0px;
        left: 0px;
        border: none;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        color: var(--link-color);
        background-color: var(--reader-bg-color);
        box-shadow:  0 0 15px rgba(0, 0, 0, 0.1);
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        justify-content: center;
    }

    .disabled {
        /* background-color: rgba(200, 200, 200, 0.1); */
        background-color: #eee;
        color: #ccc;
        cursor: not-allowed;
    }

    .control:hover:not(.disabled) {
        color: var(--highlight-color);
    }
</style>
