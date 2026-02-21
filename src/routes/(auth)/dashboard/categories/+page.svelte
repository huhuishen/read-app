<script lang="ts">
    import type { Category } from "$lib/models";

    let { data } = $props();

    let categories = $derived(data.items);

    let editing = $state<Partial<Category> | null>(null);

    let showCreate = $state(false);

    let form = $state({
        name: "",
        description: "",
        show: true,
        level: 0,
        previewSize: 6,
    });

    async function create() {
        await fetch("/api/categories", {
            method: "POST",
            body: JSON.stringify(form),
        });

        resetForm();

        // await load();
    }

    async function update() {
        await fetch("/api/categories", {
            method: "PATCH",
            body: JSON.stringify({
                oldName: editing!.name,
                ...form,
            }),
        });

        editing = null;

        resetForm();

        // await load();
    }

    async function remove(name?: string) {
        if (!name) return;
        if (!confirm("确定删除标签？")) return;

        await fetch("/api/categories", {
            method: "DELETE",
            body: JSON.stringify({ name }),
        });

        // await load();
    }

    async function move(index: number, dir: number) {
        const target = index + dir;

        if (target < 0 || target >= categories.length) return;

        const a = categories[index];
        const b = categories[target];

        await fetch("/api/categories/order", {
            method: "PATCH",
            body: JSON.stringify([
                { name: a.name, order: b.order },
                { name: b.name, order: a.order },
            ]),
        });

        // await load();
    }

    function edit(c: Partial<Category>) {
        editing = c;

        form.name = c.name ?? "";
        form.description = c.description ?? "";
        form.show = c.show ?? false;
        form.level = c.level ?? 0;
        form.previewSize = c.previewSize ?? 0;
    }

    function resetForm() {
        form.name = "";
        form.description = "";
        form.show = true;
        form.level = 0;
        form.previewSize = 6;
    }
</script>

<div class="container">
    <div class="header">
        <h1>标签管理</h1>

        <button onclick={() => (showCreate = !showCreate)}> 新建标签 </button>
    </div>

    {#if showCreate || editing}
        <div class="form">
            <input placeholder="标签名称" bind:value={form.name} />

            <input placeholder="描述" bind:value={form.description} />

            <label>
                <input type="checkbox" bind:checked={form.show} />
                首页显示
            </label>

            <select bind:value={form.level}>
                <option value="large">大</option>
                <option value="medium">中</option>
                <option value="small">小</option>
            </select>

            <input
                type="number"
                bind:value={form.previewSize}
                min="1"
                max="20"
            />

            <div class="buttons">
                {#if editing}
                    <button onclick={update}> 保存 </button>
                {:else}
                    <button onclick={create}> 创建 </button>
                {/if}

                <button
                    onclick={() => {
                        editing = null;
                        showCreate = false;
                        resetForm();
                    }}
                >
                    取消
                </button>
            </div>
        </div>
    {/if}

    <table>
        <thead>
            <tr>
                <th>排序</th>
                <th>名称</th>
                <th>显示</th>
                <th>尺寸</th>
                <th>文章数</th>
                <th>操作</th>
            </tr>
        </thead>

        <tbody>
            {#each categories as c, i}
                <tr>
                    <td>
                        <button onclick={() => move(i, -1)}>↑</button>

                        <button onclick={() => move(i, 1)}>↓</button>
                    </td>

                    <td>{c.name}</td>

                    <td>
                        {c.show ? "是" : "否"}
                    </td>

                    <td>
                        {c.level}
                    </td>

                    <td>
                        {c.articleCount}
                    </td>

                    <td>
                        <button onclick={() => edit(c)}> 编辑 </button>

                        <button onclick={() => remove(c.name)}> 删除 </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .container {
        max-width: 900px;
        margin: auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 8px;

        padding: 16px;
        border: 1px solid #ddd;
        margin: 16px 0;
    }

    .buttons {
        display: flex;
        gap: 8px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        border-bottom: 1px solid #eee;
        padding: 8px;
    }

    button {
        padding: 4px 8px;
    }
</style>
