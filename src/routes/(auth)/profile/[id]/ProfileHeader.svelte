<script lang="ts">
    import Avatar from "$lib/components/Avatar.svelte";
    import type { User } from "$lib/models";

    const {
        user,
    }: {
        user: User;
    } = $props();
</script>

<section class="flex column header g-3">
    <div class="flex row center g-3">
        <Avatar name={user.name} size="md"></Avatar>
        <h1 class="name">{user.name}</h1>
    </div>

    <p class="bio">{user.bio}</p>

    <div class="tags">
        {#each user.tags as tag}
            <span class="tag">{tag}</span>
        {/each}
    </div>
</section>

<style>
    .header {
        /* text-align: center; */
        margin: 48px 0;
    }

    .name {
        font-weight: 600;
        margin: 4px 0;
    }

    .bio {
        color: #666;
        margin-bottom: 16px;
    }

    .tags {
        display: flex;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .tag {
        padding: 4px 10px;
        border-radius: 999px;
        background: #f2f2f2;
        color: #444;
    }
</style>
