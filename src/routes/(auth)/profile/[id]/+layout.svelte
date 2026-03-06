<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { logout } from "$lib/util/client";
    import ProfileHeader from "./ProfileHeader.svelte";
    import ProfileStats from "./ProfileStats.svelte";

    const { data, children } = $props();

    // console.log(data);
    const user = $derived(data.userState);
</script>

<svelte:head>
    <title>{user.name} - 个人资料</title>
</svelte:head>

<div class="profile-container">
    <aside class="side flex column center g-3">
        <ProfileHeader {user} />
        <ProfileStats {user} />
        <!-- <ProfileActions {user} /> -->
        <!-- <Button variant="link" onclick={logout}>[退出登录]</Button> -->
    </aside>
    {@render children?.()}
</div>

<style>
    .profile-container {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
    }

    .side {
        position: fixed;
        top: 50px;
        left: calc(50% + 410px);
        /* transform: translateX(100%); */
        height: fit-content;
        width: 300px;
        background-color: var(--main-bg-color);
        padding: 1rem;
    }

    @media (max-width: 1420px) {
        /* .profile-container {
            padding:0 5px;
        } */
        .side {
            position: static;
            width: 100%;
            margin-top: 0;
            margin-bottom: 20px;
        }
    }
</style>
