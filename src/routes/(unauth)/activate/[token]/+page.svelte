<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import type { PageProps } from "./$types";

    const { params }: PageProps = $props();

    onMount(async () => {
        const r = await safeCall(
            api.post<{ message: string }, { token: string }>(
                "/api/users/activate",
                { token: params.token },
            ),
            toast,
        );

        if (r) {
            toast.show("账号激活成功，请登录！", "success");
            await goto("/login");
        }
    });

    const api = createApi();
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
