<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/components/Input.svelte";
    import Drawer from "$lib/components/overlay/Drawer.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { Category } from "$lib/models";
    import type { DataPage } from "$lib/mongolite";
    import { toast } from "$lib/stores/toast.svelte";
    import { apiRequest, createApi, safeCall } from "$lib/util/apiRequest";
    import Table, { type Column } from "../Table.svelte";

    const {
        data,
    }: {
        data: DataPage<Category>;
    } = $props();

    const columns: Column<Category>[] = [
        {
            name: "名称",
            text: (item) => item.name,
            className: "xlg",
        },
        {
            name: "有奖征文",
            text: (item) => (item.award ? "是" : ""),
        },
        {
            name: "首页显示",
            text: (item) => (item.show ? "显示" : ""),
        },
        {
            name: "类型",
            text: (item) =>
                item.level == 2
                    ? "显示封面、标题及作者"
                    : item.level == 1
                      ? "显示标题及作者"
                      : "仅显示数量",
            className: "lg",
        },
        {
            name: "相关文章",
            text: (item) =>
                item.articleCount ? item.articleCount.toString() : "0",
        },
        {
            name: "预览数量",
            text: (item) =>
                item.previewSize ? item.previewSize.toString() : "0",
        },
    ];

    const api = createApi();

    async function create() {
        const result = await safeCall(api.post("/api/categories", form), toast);
        if (!result) return;

        resetForm();

        // await load();
    }

    async function update() {
        const result = await safeCall(
            api.patch("/api/categories", {
                oldName: editing!.name,
                ...form,
            }),
            toast,
        );
        if (!result) return;

        editing = null;

        resetForm();

        // await load();
    }

    async function remove(name?: string) {
        if (!name) return;
        if (!confirm("确定删除标签？")) return;

        const result = await safeCall(
            apiRequest("/api/categories", {
                method: "DELETE",
                body: { name },
            }),
            toast,
        );
        if (!result) return;

        // await load();
    }

    async function move(index: number, dir: number) {
        const target = index + dir;

        if (target < 0 || target >= categories.length) return;

        const a = categories[index];
        const b = categories[target];

        const result = await safeCall(
            api.patch("/api/categories/order", [
                { name: a.name, order: b.order },
                { name: b.name, order: a.order },
            ]),
            toast,
        );
        if (!result) return;

        // await load();
    }

    function edit(c: Category) {
        editing = c;

        form.name = c.name ?? "";
        form.description = c.description ?? "";
        form.award = c.award ?? false;
        form.show = c.show ?? false;
        form.level = c.level ?? 0;
        form.previewSize = c.previewSize ?? 0;
        show = true;
    }

    function resetForm() {
        form.name = "";
        form.description = "";
        award: false;
        form.show = true;
        form.level = 0;
        form.previewSize = 6;

        show = false;
    }

    let show = $state(false);

    let categories = $derived(data.items);

    let editing = $state<Partial<Category> | null>(null);

    let showCreate = $state(false);

    let form = $state({
        name: "",
        description: "",
        award: false,
        show: false,
        level: 0,
        previewSize: 0,
    });
</script>

<Table
    items={data.items}
    {columns}
    id={(obj) => obj?.name}
    onSelect={(row) => {
        edit(row);
    }}
    context={[
        {
            name: "编辑",
            className: "bold",
            onclick: (row) => {
                edit(row);
            },
        },
        {
            name: "",
        },
        {
            name: "上移",
            onclick: (row) => {
                move(
                    categories.findIndex((c) => c.name === row.name),
                    -1,
                );
            },
        },
        {
            name: "下移",
            onclick: (row) => {
                move(
                    categories.findIndex((c) => c.name === row.name),
                    1,
                );
            },
        },
        {
            name: "删除",
            className: "danger",
            onclick: async (row) => {
                remove(row.name);
            },
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

<Drawer bind:show>
    <header class="drawer-header">
        <Button variant="link" onclick={() => (show = false)}>
            <Icon name="chevron-left" size={26} />返回
        </Button>
    </header>

    <div class="flex g-3 form">
        <Input
            bind:value={form.name}
            className="col-12"
            label="名称"
            placeholder="标签名称"
        ></Input>

        <Input
            bind:value={form.description}
            className="col-12"
            label="描述"
            placeholder="描述"
        ></Input>

        <Checkbox className="col-12" bind:checked={form.award} label="有奖征文"
        ></Checkbox>
        <Checkbox className="col-12" bind:checked={form.show} label="首页显示"
        ></Checkbox>

        <label class="col-12">
            <div class="label">类型</div>
            <select bind:value={form.level}>
                <option value={2}>显示封面、标题及作者</option>
                <option value={1}>显示标题及作者</option>
                <option value={0}>仅显示数量</option>
            </select>
        </label>

        <label class="col-12">
            <div class="label">预览数量</div>
            <input
                type="number"
                bind:value={form.previewSize}
                min="1"
                max="20"
            />
        </label>

        <div class="buttons">
            {#if editing}
                <Button onclick={update}>保存</Button>
            {:else}
                <Button onclick={create}>创建</Button>
            {/if}

            <Button
                onclick={() => {
                    editing = null;
                    showCreate = false;
                    resetForm();
                }}
            >
                取消
            </Button>
        </div>
    </div>
</Drawer>

<style>
    .drawer-header {
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 10px;
        background-color: var(--main-bg-color);
        height: 60px;
        z-index: 2200;
    }
    .form {
        font-size: 16px;
        padding: 1rem;
    }
</style>
