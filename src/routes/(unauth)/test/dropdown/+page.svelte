<script lang="ts">
    import Dropdown from "$lib/components/Dropdown.svelte";
    import DropdownItem from "$lib/components/DropdownItem.svelte";

    let open = $state(false);
</script>

<div class="mt4 ml1">
    <Dropdown bind:open>
        {#snippet trigger()}
            <div class="flex test">操作</div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                aria-hidden="true"
                class="icon-sm text-token-text-tertiary"
                ><use
                    href="/sprites-core-i9agxugi.svg#ba3792"
                    fill="currentColor"
                ></use></svg
            >
        {/snippet}
        <a class="flex item" href="/"> 编辑</a>
        <a class="test" href="/"> <DropdownItem>编辑</DropdownItem></a>
        <DropdownItem noHover><div class="line"></div></DropdownItem>
        <DropdownItem
            disabled
            onSelect={() => {
                console.log("delete");
                open = false;
            }}
            ><div class="flex test">操作</div>
            <span class="arrow"></span></DropdownItem
        >
    </Dropdown>
</div>

<style>
    .arrow {
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid #666;
    }

    .line {
        height: 1px;
        color: #666;
        border-bottom: 1px solid #666;
    }

    .item {
        width: 100%;
        text-align: left;
        padding: 8px 10px;
        border-radius: 8px;
        background: none;
        border: none;
        cursor: pointer;
    }

    .item:hover {
        background: #f2f3f4;
    }

    .item:active {
        background: #f2f3f4;
    }

    .item:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .no-hover {
        cursor: default;
    }
    .no-hover:hover {
        background: none; /* 不改变背景 */
    }
</style>
