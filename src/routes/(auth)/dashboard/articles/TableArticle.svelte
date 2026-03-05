<script lang="ts">
    import { goto } from "$app/navigation";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { Article } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import type { DataPage } from "$lib/mongolite";
    import { toLocalDateString } from "$lib/util/client";
    import { formatDuration } from "../../../util";
    import Table, { type Column } from "../Table.svelte";

    const {
        data,
    }: {
        data: DataPage<Article>;
    } = $props();
    const api = createApi();

    const columns: Column<Article>[] = [
        {
            name: "标题",
            text: (item) => item.title,
            className: "xlg",
        },
        {
            name: "作者",
            text: (item) => item.author ?? "",
            className: "lg",
        },
        {
            name: "状态",
            text: (item) => item.status,
        },
        {
            name: "期刊",
            text: (item) => item.category.period,
        },
        {
            name: "标签",
            text: (item) => item.tags?.join(","),
            className: "lg",
        },
        {
            name: "收藏",
            text: (item) => item.stats?.mark?.toString(),
        },
        {
            name: "评论",
            text: (item) => item.stats?.comment?.toString(),
        },
        {
            name: "投票",
            text: (item) => item.stats?.vote?.toString(),
        },
        {
            name: "阅读",
            text: (item) => item.stats?.view?.toString(),
        },
        {
            name: "读者用时",
            text: (item) =>
                formatDuration(
                    (item as Article & { readSeconds?: number }).readSeconds ??
                        0,
                ),
        },
        {
            name: "创建",
            text: (item) => toLocalDateString(item.createdAt, false),
            className: "lg",
        },
        // {
        //     name: "更新",
        //     text: (item) => toLocalDateString(item.updatedAt, false),
        //     className: "lg",
        // },
    ];
</script>

<Table
    items={data.items}
    {columns}
    onSelect={(row) => {}}
    context={[
        {
            name: "跳转",
            className: "bold",
            onclick: (row) => {
                goto(`/articles/${row.id}`);
            },
        },
        {
            name: "上/下架",
            onclick: async (row) => {
                if (!row?.id) return;

                let res;
                if (row.status === "下架") {
                    res = await safeCall(
                        api.post(`/api/articles/${row.id}`, {
                            status: "上架",
                        }),
                        toast,
                    );

                    if (!res) return;
                    row.status = "上架";
                } else if (row.status === "上架") {
                    res = await safeCall(
                        api.post(`/api/articles/${row.id}`, {
                            status: "下架",
                        }),
                        toast,
                    );

                    if (!res) return;
                    row.status = "下架";
                }

                data.items = [...data.items];
                // toast.show("已下架", "success");
            },
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
