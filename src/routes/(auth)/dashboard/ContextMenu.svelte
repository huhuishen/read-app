<script lang="ts">
    let {
        status = $bindable(),
        items,
    }: {
        status: { open: boolean; x: number; y: number; row: any };
        items: {
            name: string;
            className?: string;
            onclick?: (row: any) => void;
            disabled?: (row: any) => boolean;
        }[];
    } = $props();

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") hideRowMenu();
    }

    function hideRowMenu() {
        status.open = false;
    }

    let menuEl: HTMLDivElement | null = $state(null);

    $effect(() => {
        if (!status.open || !menuEl) return;

        // 读取真实尺寸
        const { width, height } = menuEl.getBoundingClientRect();

        if (status.x + width > window.innerWidth) status.x = status.x - width;

        if (status.y + height > window.innerHeight)
            status.y = status.y - height;
    });
</script>

<svelte:document onkeydown={onKeydown} />

{#if status.open}
    <div
        class="backdrop"
        onclick={hideRowMenu}
        oncontextmenu={hideRowMenu}
        aria-hidden="true"
    ></div>
    <div
        bind:this={menuEl}
        class="menu"
        style="left:{status.x}px; top:{status.y}px"
    >
        {#each items as item}
            {#if item.name}
                <button
                    class={item.className}
                    disabled={item.disabled?.(status.row)}
                    onclick={() => {
                        hideRowMenu();
                        item.onclick?.(status.row);
                    }}>{item.name}</button
                >
            {:else}
                <hr />
            {/if}
        {/each}
    </div>
{/if}

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        z-index: 999;
    }

    .menu {
        position: fixed;
        z-index: 1000;
        min-width: 180px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
        padding: 10px;
    }

    .menu button {
        display: block;
        width: 100%;
        border: 0;
        background: none;
        padding: 6px 12px;
        text-align: left;
        cursor: pointer;
    }

    .bold {
        font-weight: 600;
    }

    .menu button:hover {
        background: #f3f4f6;
    }

    .menu .danger {
        color: #dc2626;
    }

    .menu hr {
        border: none;
        border-top: 1px solid #eee;
    }
</style>
