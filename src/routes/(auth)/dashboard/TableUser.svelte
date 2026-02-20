<script lang="ts">
    import { goto } from "$app/navigation";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { User } from "$lib/models";
    import type { DataPage } from "$lib/mongolite";
    import { toLocalDateString } from "$lib/util/client";
    import { formatDuration } from "../util";
    import Table, { type Column } from "./Table.svelte";

    const {
        data,
    }: {
        data: DataPage<User>;
    } = $props();

    const columns: Column<User>[] = [
        {
            name: "名称",
            text: (item) => item.name,
            className: "lg",
        },
        {
            name: "帐号",
            text: (item) => item.email,
        },
        {
            name: "权限",
            text: (item) => item.roles?.join(","),
            className: "lg",
        },
        {
            name: "阅读时长",
            text: (item) => formatDuration(item.readSeconds),
        },
        {
            name: "创建",
            text: (item) => toLocalDateString(item.createdAt, false),
            className: "lg",
        },
        {
            name: "更新",
            text: (item) => toLocalDateString(item.updatedAt, false),
            className: "lg",
        },
    ];
</script>

<Table
    items={data.items}
    {columns}
    onSelect={(row) => {}}
    context={[
        {
            name: "转到",
            className: "bold",
            onclick: (row) => {
                goto(`/profile/${row.id}`);
            },
        },
        {
            name: "禁用",
            onclick: async (row) => {},
        },

        {
            name: "",
        },
        {
            name: "删除",
            className: "danger",
            onclick: async (row) => {},
            disabled: (row) => {
                return true;
            },
        },
    ]}
></Table>
<div class="mt-3 mb-3">
    <Pagination
        total={data.totalItems}
        limit={data.limit}
        page={data.page}
        formatUrl={(n) => {
            return `/dashboard/users/?page=${n}&limit=${data.limit}`;
        }}
    ></Pagination>
</div>
