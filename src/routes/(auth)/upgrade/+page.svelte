<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import TextBox from "$lib/components/Input.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { api } from "$lib/api/client";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();

    let form = $state({
        email: "",
        name: data.user.name?.replace(/^游客_/, "") ?? "",
        password: "",
    });

    let loading = $state(false);

    async function onSubmit() {
        if (!form.email || !form.name || !form.password) {
            toast.show("请填写完整信息", "error");
            return;
        }
        if (form.password.length < 6) {
            toast.show("密码至少 6 位", "error");
            return;
        }

        loading = true;
        try {
            await api.post("users/upgrade", form);
            invalidateAll();
            toast.show("转正成功！欢迎加入", "success");
            await goto("/");
        } catch {
            /* 错误已自动弹出 */
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex main">
    <div class="flex g-3 column">
        <h2>转正为永久账户</h2>
        <p class="hint">你的游客数据（阅读记录、书签、评论等）将全部保留</p>
        <TextBox label="邮箱" bind:value={form.email} />
        <TextBox label="用户名" bind:value={form.name} />
        <TextBox label="密码" type="password" bind:value={form.password} />
        <Button styles="mt-3" disabled={loading} onclick={onSubmit}>
            {loading ? "提交中..." : "转正"}
        </Button>
    </div>
</div>

<style>
    .main {
        width: 320px;
        margin: 0 auto;
        height: 100vh;
        justify-content: center;
    }
    .hint {
        color: #888;
        font-size: 0.85rem;
        margin: 0;
    }
</style>
