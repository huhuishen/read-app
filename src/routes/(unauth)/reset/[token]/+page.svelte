<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import type { PageProps } from "./$types";

    const { params }: PageProps = $props();

    const api = createApi();

    let password = $state("");
    let password2 = $state("");
    let loading = $state(false);

    async function submit() {
        if (loading) return;

        if (password !== password2) {
            toast.show("两次密码输入不一致", "error");
            return;
        }

        loading = true;

        const result = await safeCall(
            api.post<{ message: string }, { token: string; password: string }>(
                "/api/users/password-reset",
                {
                    token: params.token,
                    password,
                },
            ),
            toast,
        );

        loading = false;
        if (!result) return;

        toast.show("密码已重置，请重新登录", "success");
        await goto("/login");
    }
</script>

<svelte:head>
    <title>重置密码</title>
</svelte:head>

<div class="flex main">
    <div class="flex g-3">
        <Input
            className="col-12"
            label="新密码"
            type="password"
            bind:value={password}
        />
        <Input
            className="col-12"
            label="确认新密码"
            type="password"
            bind:value={password2}
        />
        <Button styles="col-12" disabled={loading} onclick={submit}>
            {loading ? "提交中..." : "确认重置"}
        </Button>
    </div>
</div>

<style>
    .main {
        width: 320px;
        margin: 0 auto;
        height: 100vh;
    }
</style>
