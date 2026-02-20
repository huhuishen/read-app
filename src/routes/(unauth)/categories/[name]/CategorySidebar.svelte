<script lang="ts">
    import award from "$lib/assets/award-prize-svgrepo-com.svg";

    const { data } = $props();
</script>

<div class="flex category">
    <img src={award} width="16px" alt="Award icon" />
    <h3>
        {data.params.name}
    </h3>
    <img
        src={award}
        width="16px"
        alt="Award icon"
        style="transform: scaleX(-1);"
    />
</div>

<style>
    .category {
        margin-top: 1rem;
        margin-bottom: 1rem;
        color: #b19046;
        user-select: none;
        gap: 0.25rem;
    }
</style>
