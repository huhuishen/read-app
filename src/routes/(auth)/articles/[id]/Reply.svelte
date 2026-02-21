<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { isInViewport } from "$lib/components/util";
    import { tick } from "svelte";

    let {
        cotent = $bindable(),
        placeholder = "",
        disabled = false,
        onclick,
    }: {
        cotent: string;
        placeholder?: string;
        disabled?: boolean;
        onclick?: () => void;
    } = $props();

    let inputEl: HTMLTextAreaElement | null = null;

    async function applyFocus() {
        if (!inputEl) return;

        await tick();

        if (!isInViewport(inputEl)) {
            inputEl.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
        inputEl.focus({
            preventScroll: true,
        });
    }

    // 初始 autofocus
    $effect(() => {
        applyFocus();
    });
</script>

<div class="mt-1">
    <textarea bind:this={inputEl} bind:value={cotent} {placeholder}></textarea>
    <Button {disabled} {onclick}>提交</Button>
</div>
