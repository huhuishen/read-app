<script lang="ts">
    import { goto } from "$app/navigation";
    import Tabs from "$lib/components/Tabs.svelte";
    import type { Snippet } from "svelte";

    let {
        name,
        active,
        children,
    }: { name: string; active: string; children: Snippet } = $props();

    const tabs = [
        { key: "articles", label: "作品" },
        { key: "votes", label: "投票" },
    ];
</script>

<Tabs
    {tabs}
    {active}
    onclick={(key) => {
        goto(`/categories/${name}/${key}`);
    }}
>
    {@render children?.()}
</Tabs>
