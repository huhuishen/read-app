<script lang="ts">
    import ContributionCalendar from "./ContributionCalendar.svelte";

    let { days } = $props();
</script>

{#if !days}
    <p class="empty">暂无数据</p>
{:else}
    <ContributionCalendar {days} />
{/if}

<style>
    .empty {
        color: #aaa;
    }
</style>
