<script lang="ts">
    let {
        className = "",
        checked = $bindable(),
        id,
        placeholder = "",
        label,
    }: {
        className?: string;
        checked: boolean;
        id?: string;
        placeholder?: string;
        label?: string;
    } = $props();
</script>

<label class={className}>
    <input {id} type="checkbox" bind:checked required {placeholder} />
    {#if label}
        <span class="label">{label}</span>
    {/if}
</label>
