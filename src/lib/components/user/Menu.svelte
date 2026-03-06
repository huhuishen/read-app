<script lang="ts">
    import { goto } from "$app/navigation";
    import type { User } from "$lib/models";
    import { logout } from "$lib/util/client";
    import Avatar from "../Avatar.svelte";
    import Dropdown, { type DropdownProps } from "../Dropdown.svelte";

    let {
        user,
    }: {
        user: Partial<User>;
    } = $props();

    type MenuItem = DropdownProps["items"][number];

    const items = $derived<DropdownProps["items"]>([
        ...(user?.roles?.includes("administrator")
            ? [
                  {
                      name: "管理",
                      onclick: () => goto(`/dashboard/articles`),
                  } satisfies MenuItem,
              ]
            : []),
        {
            name: "个人中心",
            onclick: () => goto(`/profile/${user.id}/articles`),
        },
        {
            name: "发表",
            onclick: () => goto(`/articles/write`),
        },
        { name: "" },
        {
            name: "退出登录",
            onclick: logout,
        },
    ]);
</script>

<Dropdown {items}><Avatar name={user.email ?? ""}></Avatar></Dropdown>
