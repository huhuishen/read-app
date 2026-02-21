<script lang="ts">
    import { tick } from "svelte";

    let {
        className = "",
        value = $bindable(),
        id,
        placeholder = "",
        label,
        type = "text",
        // 新增
        autofocus = false,
        focusTrigger = 0, // 用于手动重新触发focus
    }: {
        className?: string;
        value: string;
        id?: string;
        placeholder?: string;
        label?: string;
        type?: string;
        autofocus?: boolean;
        focusTrigger?: number;
    } = $props();

    let inputEl: HTMLInputElement | null = null;

    async function applyFocus() {
        if (!inputEl) return;

        await tick();

        inputEl.focus({
            preventScroll: true,
        });
    }

    // 初始 autofocus
    $effect(() => {
        if (!autofocus) return;
        applyFocus();
    });

    // 外部重新触发 focus
    $effect(() => {
        focusTrigger;
        if (!autofocus) return;
        applyFocus();
    });

    // 暴露方法给父组件
    export function focus() {
        applyFocus();
    }

    export function blur() {
        inputEl?.blur();
    }
</script>

<label class={className}>
    {#if label}
        <div class="label">{label}</div>
    {/if}

    <input bind:this={inputEl} {id} {type} bind:value required {placeholder} />
</label>
