<script lang="ts">
    import { onMount } from "svelte";

    let {
        styles = "",
        value = $bindable(),
        id = null,
        placeholder = "",
        label,
        type = "text",
        children = null,
    } = $props();

    let el: HTMLTextAreaElement | null = $state(null);

    function resize() {
        if (!el) return;

        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }

    onMount(() => {
        if (type === "textarea") {
            resize();
        }
    });
</script>

<!-- <label class={styles}
    >{label}
    {#if type === "textarea"}
        <textarea
            bind:this={el}
            {id}
            bind:value
            required
            {placeholder}
            oninput={resize}
        ></textarea>
    {:else if type === "select"}
        <select {id} bind:value required>
            {@render children?.()}
        </select>
    {:else}
        <input {id} {type} bind:value required {placeholder} />
    {/if}
</label> -->
<label class={styles}>
    {label}
    <input {id} {type} bind:value required {placeholder} />
</label>
