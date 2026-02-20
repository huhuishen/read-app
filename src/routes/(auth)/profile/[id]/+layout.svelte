<script lang="ts">
    import ProfileHeader from "./ProfileHeader.svelte";
    import ProfileStats from "./ProfileStats.svelte";
    import ProfileActions from "./ProfileActions.svelte";
    import ProfileTabs from "./ProfileTabs.svelte";
    import Button from "$lib/components/Button.svelte";
    import { logout } from "$lib/util/client";

    // type UserProfile = {
    //     id: string;
    //     name: string;
    //     bio: string;
    //     avatar: string;
    //     tags: string[];
    //     stats: {
    //         followers: number;
    //         following: number;
    //         reads: number;
    //     };
    // };

    const { data, children } = $props();

    // console.log(data);
    const user = $derived(data.userState);
    // let user = $state<UserProfile>({
    //     id: "1",
    //     name: "User",
    //     bio: "用阅读对抗平庸。",
    //     avatar: "https://i.pravatar.cc/300",
    //     tags: ["连中三元", "评论家 lv1", "创作新星 lv1"],
    //     stats: {
    //         followers: 430,
    //         following: 120,
    //         reads: 85,
    //     },
    // });
</script>

<svelte:head>
    <title>{user.name} - 个人资料</title>
</svelte:head>

<div class="profile-container">
    {@render children?.()}
    <aside class="side flex column center g-3">
        <ProfileHeader {user} />
        <ProfileStats {user} />
        <!-- <ProfileActions {user} /> -->
        <Button variant="link" onclick={logout}>[退出登录]</Button>
    </aside>
</div>

<style>
    .profile-container {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
        /* padding: 0 30px; */
    }

    .layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 16px;
    }

    .side {
        position: fixed;
        top: 30px;
        left: calc(50% + 410px);
        /* transform: translateX(100%); */
        height: fit-content;
        width: 300px;
        background-color: white;
        padding: 1rem;
    }

    @media (max-width: 1420px) {
        /* .profile-container {
            padding:0 5px;
        } */
        .layout {
            grid-template-columns: 1fr;
        }

        .side {
            position: static;
            width: 100%;
            margin-top: 20px;
        }
    }
</style>
