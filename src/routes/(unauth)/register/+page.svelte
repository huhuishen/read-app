<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import TextBox from "$lib/components/TextBox.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";

    let registerState = $state({
        email: "",
        password: "",
        name: "",
    });

    let loading = $state(false);

    const api = createApi();
</script>

<div class="flex main">
    <div class="flex g-3">
        <TextBox
            styles="col-12"
            label="邮箱"
            bind:value={registerState.email}
        />

        <TextBox
            styles="col-12"
            label="用户名"
            bind:value={registerState.name}
        />

        <TextBox
            styles="col-12"
            label="密码"
            type="password"
            bind:value={registerState.password}
        />

        <Button
            styles="col-12"
            disabled={loading}
            onclick={async () => {
                loading = true;

                const r = await safeCall(
                    api.post<
                        { message: string },
                        { email: string; password: string; name: string }
                    >("/api/users/register", registerState),
                    toast,
                );

                loading = false;

                if (r) {
                    toast.show("注册成功，请查收邮箱激活账号！", "success");
                    await goto("/login");
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
