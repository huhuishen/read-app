<script lang="ts">
    import { goto } from "$app/navigation";
    import type { User } from "$lib/models";
    import { logout } from "$lib/util/client";
    import Avatar from "../Avatar.svelte";
    import Dropdown from "../Dropdown.svelte";

    let {
        user,
    }: {
        user: Partial<User>;
    } = $props();

    let items = $state();
    if (user?.roles?.includes("administrator")) {
        items = [
            {
                name: "个人中心",
                onclick: () => {
                    goto(`/profile/${user.id}/articles`);
                },
            },
            {
                name: "管理",
                onclick: () => {
                    goto(`/dashboard`);
                },
            },
            { name: "" },
            {
                name: "退出登录",
                onclick: logout,
            },
        ];
    } else {
        items = [
            {
                name: "个人中心",
                onclick: () => {
                    goto(`/profile/${user.id}/articles`);
                },
            },
            {
                name: "发表",
                onclick: () => {
                    goto(`/articles/write`);
                },
            },
            { name: "" },
            {
                name: "退出登录",
                onclick: logout,
            },
        ];
    }
</script>

<Dropdown {items}><Avatar name={user.name!}></Avatar></Dropdown>
