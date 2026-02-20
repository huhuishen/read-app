<script lang="ts">
    import type { Snippet } from "svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import SortIcon from "./SortIcon.svelte";

    export interface Column<T = any> {
        name: string;
        key?: string;
        text: (item: T) => string;
        value?: (item: T) => any;
        cell?: Snippet<[T]>;
        className?: string;
    }

    type TableProps<T = any> = {
        items: T[];
        columns: Column<T>[];
        className?: string;
        onSelect?: (row: T) => void;
        active?: T;
        context?: {
            name: string;
            className?: string;
            onclick?: (row: any) => void;
            disabled?: (row: any) => boolean;
        }[];
        id?: (obj: T) => any;
    };

    let {
        items,
        columns,
        className,
        onSelect,
        active = $bindable(),
        context,
        id = (obj) => obj?.id,
    }: TableProps = $props();

    let status = $state({
        open: false,
        x: 0,
        y: 0,
        row: null,
    });

    let sortKey = $state(-1);
    let asc = $state(true);

    function sortBy(index: number) {
        if (sortKey === index) asc = !asc;
        else {
            sortKey = index;
            asc = true;
        }

        items = [...items].sort((a, b) => {
            const valA = columns[index].value?.(a) ?? columns[index].text(a);
            const valB = columns[index].value?.(b) ?? columns[index].text(b);
            if (valA < valB) return asc ? -1 : 1;
            if (valA > valB) return asc ? 1 : -1;
            return 0;
        });
    }
</script>

<table class={className}>
    <thead>
        <tr>
            {#each columns as col, index}
                <th class={col.className} onclick={() => sortBy(index)}
                    ><div class="th-sort">
                        {col.name}
                        <SortIcon active={sortKey === index} {asc} />
                    </div></th
                >
            {/each}
        </tr>
    </thead>

    <tbody>
        {#each items as row}
            <tr
                class:active={id(active) === id(row)}
                tabindex="0"
                ondblclick={() => {
                    active = row;
                    onSelect?.(row);
                }}
                onclick={() => {
                    active = row;
                }}
                oncontextmenu={(e) => {
                    active = row;

                    e.preventDefault();
                    status = {
                        open: true,
                        x: e.x,
                        y: e.y,
                        row,
                    };
                }}
            >
                {#each columns as col}
                    <td>
                        <div class="cell">
                            {#if col.cell}
                                {@render col.cell(row)}
                            {:else}
                                {col.text?.(row)}
                            {/if}
                        </div>
                    </td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

{#if context}
    <ContextMenu bind:status items={context}></ContextMenu>
{/if}

<style>
    table {
        table-layout: fixed;
        border-collapse: collapse;
        border: 1px solid #ddd;
        cursor: default;
        user-select: none;
        display: block;
        overflow-x: auto;
    }

    table th,
    table td {
        padding: 6px 12px;
        text-align: left;
        /* word-wrap: break-word;
        word-break: break-all; */

        /* overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis; */

        min-width: 100px;
    }

    .lg {
        min-width: 180px;
    }
    .xlg {
        min-width: 360px;
    }

    table th {
        border-right: 1px solid #ccc;
    }
    /* table th:last-child {
        border-right: none;
    } */
    table th:hover {
        background: #007acc27;
    }

    table tbody tr:hover {
        background: #007acc27;
    }
    table tr {
        /* border: 1px solid transparent; */
        cursor: pointer;
    }
    table tr.active {
        outline: 1px solid #007acc;
        outline-offset: -1px;
        /* box-shadow: inset 0 0 0 1px #007acc;
        position: relative;
        z-index: 1; */
        background-color: #007acc10;
    }

    .th-sort {
        display: flex;
        align-items: center;
        justify-content: space-between; /* 关键：两端对齐 */
        gap: 6px;
        width: 100%;
    }
    .cell {
        display: flex;
        gap: 10px;
    }

    /* @media (max-width: 768px) {
        table {
        }
    } */
</style>
