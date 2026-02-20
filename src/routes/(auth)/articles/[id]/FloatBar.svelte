<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";

    type Action = {
        label: string;
        icon?: string;
        disabled?: () => boolean;
        onclick: () => void;
    };

    let {
        actions,
    }: {
        actions: Action[];
    } = $props();
</script>

<div class="flex column g-3">
    {#each actions as action}
        <button
            class="action"
            disabled={action.disabled?.()}
            onclick={action.onclick}
            title={action.label}
        >
            {#if action.icon}
                <Icon name={action.icon} size={20}></Icon>
            {:else}
                <span>{action.label}</span>
            {/if}
        </button>
    {/each}
</div>

<style>
    /* .float-button {
        position: fixed;
        right: 1rem;
        bottom: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
    } */
    .action {
        border: none;
        color: #333;
        width: 48px;
        height: 48px;
        border-radius: 50%;
    }
</style>
