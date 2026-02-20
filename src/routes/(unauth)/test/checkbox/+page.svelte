<script lang="ts">
    import Checkbox from "$lib/components/Checkbox.svelte";

    let agree = $state(false);

    interface Item {
        id: string;
        title: string;
        description: string;
    }

    let selected = $state<Set<string>>(new Set());

    function toggle(id: string) {
        if (selected.size >= 3 && !selected.has(id)) return;

        selected = new Set(selected);

        selected.has(id) ? selected.delete(id) : selected.add(id);
    }

    const items: Item[] = [
        {
            id: "1",
            title: "Card One",
            description: "This is the description for card one.",
        },
        {
            id: "2",
            title: "Card Two",
            description:
                "This card has a bit longer description to test wrapping.",
        },
        {
            id: "3",
            title: "Card Three",
            description: "Short description.",
        },
        {
            id: "4",
            title: "Card Four",
            description: "Another example card with a description.",
        },
        {
            id: "5",
            title: "Card Five",
            description: "Final test card.",
        },
    ];
</script>

<div class="mt4 ml1">
    <Checkbox bind:checked={agree} label="我已阅读并同意协议" />
    <Checkbox bind:checked={agree} readonly label="我已阅读并同意协议" />

    <p>当前状态：{agree ? "已勾选" : "未勾选"}</p>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    {#each items as item}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
            class="card"
            tabindex="0"
            aria-selected={selected.has(item.id)}
            onclick={() => toggle(item.id)}
            onkeydown={(e) => e.key === " " && toggle(item.id)}
        >
            <Checkbox
                checked={selected.has(item.id)}
                readonly
                disabled={selected.size >= 3 && !selected.has(item.id)}
            />

            <div class="content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
            </div>
        </div>
    {/each}

    <pre>
        {JSON.stringify($state.snapshot(selected.size))}
    </pre>
</div>

<style>
    .card {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        cursor: pointer;
        margin: 1rem;
        outline: none;
    }

    .card:focus {
        box-shadow: 0 0 0 3px color-mix(in srgb, #e5e7eb 50%, transparent);
    }

    .card[aria-selected="true"] {
        background-color: white;
    }
</style>
