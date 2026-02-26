<script lang="ts">
    import { goto } from "$app/navigation";
    import Tabs from "$lib/components/Tabs.svelte";
    import type { Snippet } from "svelte";

    let {
        name,
        tabs,
        active,
        children,
    }: {
        name: string;
        tabs: { key: string; label: string }[];
        active: string;
        children: Snippet;
    } = $props();
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
