<script lang="ts">
    import { goto } from "$app/navigation";
    import Tabs from "$lib/components/Tabs.svelte";
    import type { Snippet } from "svelte";

    let {
        name,
        active,
        children,
    }: {
        name: string;
        active: string;
        children: Snippet;
    } = $props();

    let tabs = [
        { key: "articles", label: "作品" },
        { key: "comments", label: "评论" },
        { key: "votes", label: "投票" },
    ];
</script>

<Tabs
    {tabs}
    {active}
    enableSwipe
    onclick={(key) => {
        goto(`/categories/${name}/${key}`, { replaceState: true });
    }}
>
    {@render children?.()}
</Tabs>

