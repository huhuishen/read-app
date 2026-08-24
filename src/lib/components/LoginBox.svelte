<script lang="ts">
    import { goto } from "$app/navigation";
    import LoginModal from "$lib/components/LoginModal.svelte";
    import type { User } from "$lib/models";
    import { session } from "$lib/stores/session.svelte";
    import { toast } from "$lib/stores/toast.svelte.js";
    import { api } from "$lib/api/client";
    import Avatar from "./Avatar.svelte";

    let {
        user,
        showLogin = $bindable(false),
        redirect = $bindable("/"),
    }: {
        user: Partial<User> | null;
        showLogin?: boolean;
        redirect: string;
    } = $props();

    let account = $state("");
    let password = $state("");
    let nickname = $state("");
    let register = $state(false);

    async function invalidate() {
        // await invalidateAll();
        goto(redirect, {
            invalidateAll: true,
            replaceState: false,
        });
    }

    toast.skipSuccess = true;
</script>

{#if user}
    <a class="flex link" href="/users/{user.id}"
        ><Avatar name={user.name ?? ""}></Avatar>
    </a>
{:else}
    <a class="link" href="/login">登录 </a>
{/if}

<LoginModal
    bind:show={showLogin}
    bind:account
    bind:password
    bind:nickname
    bind:register
    onSubmit={async () => {
        if (register) {
            try {
                await api.post("users/register", {
                    account,
                    name: nickname,
                    password,
                });
                password = "";
                toast.show("注册成功！", "success");
                register = false;
            } catch {
                /* 错误已自动弹出 */
            }
        } else {
            // const fp = await FingerprintJS.load();
            // const result = await fp.get();
            // console.log(result);

            try {
                const r = await api.post<User>("users/auth", {
                    account,
                    password,
                    // visitorId: result.visitorId,
                });

                showLogin = false;
                account = "";
                password = "";

                session.user = r;
                // console.log($state.snapshot(session.user));

                toast.show("登录成功！", "success");
                await invalidate();
            } catch {
                /* 错误已自动弹出 */
            }
        }
    }}
></LoginModal>

<style>
    .link {
        font-size: 0.9rem;
        text-decoration: none;
        cursor: pointer;
    }
</style>
