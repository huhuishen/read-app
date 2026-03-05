<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/components/Input.svelte";
    import Drawer from "$lib/components/overlay/Drawer.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { Tag } from "$lib/models";
    import type { DataPage } from "$lib/mongolite";
    import { toast } from "$lib/stores/toast.svelte";
    import { apiRequest, createApi, safeCall } from "$lib/util/apiRequest";
    import Table, { type Column } from "../Table.svelte";

    const {
        data,
    }: {
        data: DataPage<Tag>;
    } = $props();

    const columns: Column<Tag>[] = [
        {
            name: "名称",
            text: (item) => item.name,
            className: "xlg",
        },
        {
            name: "首页显示",
            text: (item) => (item.show ? "显示" : "不显示"),
        },
        {
            name: "相关文章",
            text: (item) =>
                item.articleCount ? item.articleCount.toString() : "0",
        },
    ];

    const api = createApi();

    async function create() {
        const result = await safeCall(api.post("/api/tags", form), toast);
        if (!result) return;

        resetForm();
        location.reload();
    }

    async function update() {
        const result = await safeCall(
            api.patch("/api/tags", {
                oldName: editing!.name,
                ...form,
            }),
            toast,
        );
        if (!result) return;

        editing = null;
        resetForm();
        location.reload();
    }

    async function remove(name?: string) {
        if (!name) return;
        if (!confirm("确定删除该标签吗？")) return;

        const result = await safeCall(
            apiRequest("/api/tags", {
                method: "DELETE",
                body: { name },
            }),
            toast,
        );
        if (!result) return;

        location.reload();
    }

    function edit(tag: Tag) {
        editing = tag;

        form.name = tag.name ?? "";
        form.show = tag.show ?? true;
        show = true;
    }

    function newTag() {
        editing = null;
        resetForm();
        show = true;
    }

    function resetForm() {
        form.name = "";
        form.show = true;
        show = false;
    }

    let show = $state(false);
    let editing = $state<Partial<Tag> | null>(null);

    let form = $state({
        name: "",
        show: true,
    });
</script>

<div class="mb-3">
    <Button onclick={newTag}>新建标签</Button>
</div>

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
            name: "删除",
            className: "danger",
            onclick: async (row) => {
                remove(row.name);
            },
            disabled: (row) => {
                return (row.articleCount ?? 0) > 0;
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
            return `/dashboard/tags/?page=${n}&limit=${data.limit}`;
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

        <Checkbox
            className="col-12"
            bind:checked={form.show}
            label="首页显示"
        ></Checkbox>

        <div class="flex sb mt-3 buttons">
            {#if editing}
                <Button onclick={update}>保存</Button>
            {:else}
                <Button onclick={create}>创建</Button>
            {/if}

            <Button
                onclick={() => {
                    editing = null;
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
    .buttons {
        width: 100%;
    }
</style>
