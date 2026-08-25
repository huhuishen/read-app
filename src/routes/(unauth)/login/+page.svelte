<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import TextBox from "$lib/components/Input.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { api } from "$lib/api/client";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();

    let userState = $state({ email: "", password: "" });

    async function onlogin() {
        try {
            const user = await api.post<{ roles: string[] }>(
                "users/login",
                userState,
            );

            const url = user.roles?.includes("administrator")
                ? "/dashboard"
                : "/";

            invalidateAll();
            await goto(data.home ?? url);
            toast.show("登录成功！", "success");
        } catch {
            /* 错误已自动弹出 */
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.code === "Enter") {
            onlogin();
        }
    }

    function quickFill(name: string) {
        userState.email = name;
        userState.password = name;
    }
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="flex main">
    <div class="flex g-3 column start">
        <TextBox
            // className="w-100"
            label="邮箱"
            bind:value={userState.email}
            autofocus
        ></TextBox>
        <TextBox
            // className="col-12"
            label="密码"
            type="password"
            bind:value={userState.password}
        ></TextBox>
        <Button styles="mt-3" onclick={onlogin}>登录</Button>
        <div class="mt-1">
            <div>演示帐号</div>
            <div class="flex g-2 mt-1">
                {#each ["admin", "user", "editor", "1"] as name}
                    <button class="dim" onclick={() => quickFill(name)}
                        >{name}</button
                    >
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .main {
        width: 300px;
        margin: 0 auto;
        height: 100vh;
    }
    .dim {
        /* color: #aaa; */
    }
</style>
