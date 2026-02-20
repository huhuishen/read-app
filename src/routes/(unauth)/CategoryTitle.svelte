<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import award from "$lib/assets/award-prize-svgrepo-com.svg";

    interface Props {
        laurel: boolean;
        name: string;
    }

    let { laurel = false, name }: Props = $props();
</script>

<div class="flex sb category">
    <div class="flex g-1">
        {#if laurel}
            <img src={award} width="16px" alt="Award icon" />
        {/if}
        <h3>
            {name}
        </h3>
        {#if laurel}
            <img
                src={award}
                width="16px"
                alt="Award icon"
                style="transform: scaleX(-1);"
            />
        {/if}
    </div>
    <a class="flex g-1" href="/categories/{encodeURI(name)}/articles"
        >查看全部<Icon name="chevron_right" size={16} />
    </a>
</div>

<style>
    .category {
        width: 100%;
        margin-top: 2rem;
        margin-bottom: 0.5rem;
        color: #b19046;
        user-select: none;
    }
</style>
