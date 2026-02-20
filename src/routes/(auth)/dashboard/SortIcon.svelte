<script lang="ts">
    export let active: boolean = false;
    export let asc: boolean = true;
</script>

<svg
    class="sort-icon"
    width="20"
    height="20"
    viewBox="0 0 12 12"
    aria-hidden="true"
>
    {#if active}
        {#if asc}
            <path d="M6 5 L3.5 7.5 M6 5 L8.5 7.5" />
        {:else}
            <path d="M6 7.5 L3.5 5 M6 7.5 L8.5 5" />
        {/if}
    {/if}
</svg>

<style>
    .sort-icon {
        margin-left: 6px;
        vertical-align: middle;
    }

    .sort-icon path {
        fill: none;
        stroke: #9ca3af; /* gray-400 */
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>
