<script lang="ts">
    import { browser } from "$app/environment";
    import type { Snippet } from "svelte";
    import { isInput } from "../util";

    let {
        show = $bindable(),
        children,
        clickClose = true,
    }: { show: boolean; children?: Snippet; clickClose?: boolean } = $props();

    $effect(() => {
        if (!browser) return;

        if (show) {
            document.body.style.overflow = "hidden";

            // cleanup 在 show 变 false 或组件销毁时执行
            return () => {
                document.body.style.removeProperty("overflow");
            };
        }
    });

    function handleKeydown(e: KeyboardEvent) {
        if (!show) return;

        if (e.code === "Escape" && show === true && !isInput(e.target)) {
            show = false;
            // e.preventDefault();
            e.stopPropagation();
        }
    }

    function handlePointerDown(e: PointerEvent) {
        // only close when clicking on overlay itself
        if (!clickClose) return;
        if (e.target === e.currentTarget) {
            show = false;
        }
    }
</script>

<svelte:document onkeydown={handleKeydown} />

{#if show}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="overlay-mask" onpointerdown={handlePointerDown}></div>
    {@render children?.()}
{/if}

<style>
    .overlay-mask {
        position: fixed;
        inset: 0;
        z-index: 2000;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.2);
    }
</style>
