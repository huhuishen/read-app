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
</script>

<Dropdown
    items={[
        {
            name: "个人中心",
            onclick: () => {
                goto(`/profile/${user.id}/articles`);
            },
        },
        {
            name: "退出登录",
            onclick: logout,
        },
    ]}
    ><Avatar name={user.name!}></Avatar>
</Dropdown>
