<script lang="ts">
    import CategoryTitle from "../../CategoryTitle.svelte";

    const { data } = $props();
</script>

<div class="flex category">
    <CategoryTitle name={data.params.name}></CategoryTitle>
</div>

<style>
    .category {
        margin-top: 1rem;
        margin-bottom: 1rem;
        color: var(--brand-gold);

        user-select: none;
        gap: 0.25rem;
    }
</style>
