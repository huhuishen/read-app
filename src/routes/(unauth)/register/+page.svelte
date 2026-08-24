<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import TextBox from "$lib/components/Input.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { api } from "$lib/api/client";

    let registerState = $state({
        email: "",
        password: "",
        name: "",
    });

    let loading = $state(false);
</script>

<div class="flex main">
    <div class="flex g-3">
        <TextBox
            className="col-12"
            label="邮箱"
            bind:value={registerState.email}
        />

        <TextBox
            className="col-12"
            label="用户名"
            bind:value={registerState.name}
        />

        <TextBox
            className="col-12"
            label="密码"
            type="password"
            bind:value={registerState.password}
        />

        <Button
            styles="col-12"
            disabled={loading}
            onclick={async () => {
                loading = true;

                try {
                    await api.post<{ message: string }>(
                        "users/register",
                        registerState,
                    );
                    toast.show("注册成功，请查收邮箱激活账号！", "success");
                    await goto("/login");
                } catch {
                    /* 错误已自动弹出 */
                } finally {
                    loading = false;
                }
            }}
        >
            注册
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
