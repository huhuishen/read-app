<script lang="ts">
    import { goto } from "$app/navigation";
    import Tabs from "$lib/components/Tabs.svelte";
    import type { User } from "$lib/models";
    import type { Snippet } from "svelte";

    let {
        active,
        user,
        children,
    }: { active: string; user: User; children: Snippet } = $props();

    const tabs = [
        { key: "articles", label: "作品" },
        { key: "reads", label: "读过" },
        { key: "comments", label: "评论" },
        // { key: "friends", label: "好友" },
        { key: "activity", label: "统计" },
    ];
</script>

<Tabs
    {tabs}
    {active}
    onclick={(key) => {
        goto(`/profile/${user.id}/${key}`);
    }}
>
    {@render children?.()}
</Tabs>
