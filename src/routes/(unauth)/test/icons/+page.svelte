<script lang="ts">
    import { onMount } from "svelte";

    type SvgSymbol = {
        id: string;
        viewBox: string;
    };

    let symbols = $state<SvgSymbol[]>([]);
    let spriteLoaded = $state(false);

    // console.log(icons);

    const spriteUrl = "/src/lib/assets/icons.svg";

    onMount(async () => {
        const res = await fetch(spriteUrl);
        const text = await res.text();
        // debugger
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const nodes = Array.from(doc.querySelectorAll("symbol"));

        symbols = nodes.map((s) => ({
            id: s.id,
            viewBox: s.getAttribute("viewBox") ?? "0 0 24 24",
        }));

        // 把整个 sprite 注入到页面（隐藏）
        const hidden = document.createElement("div");
        hidden.style.display = "none";
        hidden.innerHTML = text;
        document.body.prepend(hidden);

        spriteLoaded = true;
    });
</script>

{#if !spriteLoaded}
    <p>Loading icons…</p>
{:else}
    <div class="grid">
        {#each symbols as icon}
            <div class="item">
                <svg viewBox={icon.viewBox} aria-hidden="true">
                    <use href={`#${icon.id}`} />
                </svg>
                <div class="label">{icon.id}</div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 16px;
    }

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
    }

    svg {
        width: 32px;
        height: 32px;
        fill: none;
        stroke: currentcolor;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .label {
        margin-top: 6px;
        font-size: 12px;
        color: #555;
        word-break: break-all;
        text-align: center;
    }
</style>
