<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import TextBox from "$lib/components/TextBox.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();

    let userState = $state({ email: "", password: "" });

    const api = createApi();

    async function onlogin() {
        const user = await safeCall(
            api.post<
                { roles: string[] },
                {
                    email: string;
                    password: string;
                }
            >("/api/users/login", userState),
            toast,
        );

        if (user) {
            const url = user.roles?.includes("administrator")
                ? "/dashboard"
                : "/";

            invalidateAll();
            await goto(data.home ?? url);
            toast.show("登录成功！", "success");
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.code === "Enter") {
            onlogin();
        }
    }
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="flex main">
    <div class="flex g-3">
        <TextBox
            className="col-12"
            label="邮箱"
            bind:value={userState.email}
            autofocus
        ></TextBox>
        <TextBox
            className="col-12"
            label="密码"
            type="password"
            bind:value={userState.password}
        ></TextBox>
        <Button styles="mt-3" onclick={onlogin}>登录</Button>
    </div>
</div>

<style>
    .main {
        width: 300px;
        margin: 0 auto;
        height: 100vh;
    }
</style>
