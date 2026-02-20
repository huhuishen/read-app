<script lang="ts">
    import Button from "$lib/components/Button.svelte";

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
</script>

<div class="mt-1">
    <textarea bind:value={cotent} {placeholder}></textarea>

    <Button {disabled} {onclick}>提交</Button>
</div>
