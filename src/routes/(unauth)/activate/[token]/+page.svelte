<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { api } from "$lib/api/client";
    import type { PageProps } from "./$types";

    const { params }: PageProps = $props();

    onMount(async () => {
        try {
            await api.post<{ message: string }>("users/activate", {
                token: params.token,
            });
            toast.show("账号激活成功，请登录！", "success");
            await goto("/login");
        } catch {
            /* 错误已自动弹出 */
        }
    });
</script>

<div class="flex main">
    <div>正在激活账号...</div>
</div>

<style>
    .main {
        height: 100vh;
        justify-content: center;
        align-items: center;
    }
</style>
