<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { visible } from "$lib/components/visible";
    import { tick } from "svelte";

    let {
        root,
        cotent = $bindable(),
        placeholder = "",
        disabled = false,
        onclick,
    }: {
        root: HTMLElement;
        cotent: string;
        placeholder?: string;
        disabled?: boolean;
        onclick?: () => void;
    } = $props();

    let inputEl: HTMLTextAreaElement | null = null;

    async function applyFocus() {
        if (!inputEl) return;

        await tick();

        inputEl.focus({
            preventScroll: true,
        });
    }

    // 初始 autofocus
    $effect(() => {
        applyFocus();
    });

    let el = $state<HTMLElement>();
</script>

<div
    class="mt-1"
    bind:this={el}
    use:visible={{
        root,
        threshold: 0.1,
        onChange: (v) => {
            if (!v && el) {
                el.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "nearest",
                });
            }
        },
    }}
>
    <textarea bind:this={inputEl} bind:value={cotent} {placeholder}></textarea>
    <Button {disabled} {onclick}>提交</Button>
</div>
