<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import TextBox from "$lib/components/TextBox.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { safe, SafeError } from "$lib/util/safe";

    // 页面数据
    let { data } = $props();

    let name = $state("");
    let size = $state(0);
</script>

<div>
    <div class="create">
        <TextBox label="名称" type="text" id="name" bind:value={name}></TextBox>
        <TextBox label="展示容量" type="text" id="size" bind:value={size}
        ></TextBox>
        <Button
            onclick={async () => {
                // console.log($state.snapshot(article));
                try {
                    const r = await fetch(`/api/category`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ name, size }),
                    });

                    if (r.ok) {
                        invalidateAll();
                    } else {
                        throw new SafeError(500, "asdf");
                    }
                } catch (error) {
                    toast.show("添加分类出错，名称是否重复", "error");
                }
            }}>添加</Button
        >
    </div>

    {#if data.categories.length > 0}
        {#each data.categories as category}
            <div
                class="category"
                onclick={() => {
                    name = category.name;
                    size = category.previewSize;
                }}
            >
                {category.name}
            </div>
        {/each}
    {:else}
        <div>暂无分类</div>
    {/if}
</div>

<style>
    .create {
        margin: 1rem 0;
    }

    .category {
        margin: 1rem 0;
    }
</style>
