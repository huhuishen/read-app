<script lang="ts">
    import { goto } from "$app/navigation";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { Article } from "$lib/models";
    import type { DataPage } from "$lib/mongolite";
    import { toLocalDateString } from "$lib/util/client";
    import { formatDuration } from "../util";
    import Table, { type Column } from "./Table.svelte";

    const {
        data,
    }: {
        data: DataPage<Article>;
    } = $props();

    const columns: Column<Article>[] = [
        {
            name: "标题",
            text: (item) => item.title,
            className: "xlg",
        },
        {
            name: "作者",
            text: (item) => item.author,
            className: "lg",
        },
        {
            name: "状态",
            text: (item) => item.status,
        },
        {
            name: "栏目标签",
            text: (item) => item.categories?.join(","),
            className: "lg",
        },
        {
            name: "收藏",
            text: (item) => item.bookmarkCount?.toString(),
        },
        {
            name: "评论",
            text: (item) => item.commentCount?.toString(),
        },
        {
            name: "投票",
            text: (item) => item.voteCount?.toString(),
        },
        {
            name: "阅读",
            text: (item) => item.viewCount?.toString(),
        },
        {
            name: "读者用时",
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
                goto(`/articles/${row.id}`);
            },
        },
        {
            name: "上/下架",
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
            return `/dashboard/articles/?page=${n}&limit=${data.limit}`;
        }}
    ></Pagination>
</div>
