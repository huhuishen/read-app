<script lang="ts">
    import { goto } from "$app/navigation";
    import Tabs from "$lib/components/Tabs.svelte";
    import type { Snippet } from "svelte";

    const { active, children }: { active: string; children: Snippet } =
        $props();
</script>

<Tabs
    tabs={[
        { key: "articles", label: "作品" },
        { key: "users", label: "用户" },
        { key: "stats", label: "统计" },
    ]}
    {active}
    onclick={(active) => {
        goto(`/dashboard/${active}`);
    }}
>
    {@render children?.()}
</Tabs>
