<script lang="ts">
    import { goto } from "$app/navigation";
    import LoginModal from "$lib/components/LoginModal.svelte";
    import type { User } from "$lib/models";
    import { session } from "$lib/stores/session.svelte";
    import { toast } from "$lib/stores/toast.svelte.js";
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
        ><Avatar name={user.name}></Avatar>
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
            const r = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    account,
                    name: nickname,
                    password,
                }),
                credentials: "include", // 重要：允许携带和接收cookies
            });

            if (r.ok) {
                password = "";
                toast.show("注册成功！", "success");
                register = false;
            } else {
                var error = await r.json();
                toast.show(error.error, "error");
            }
        } else {
            // const fp = await FingerprintJS.load();
            // const result = await fp.get();
            // console.log(result);

            const r = await fetch("/api/users/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    account,
                    password,
                    // visitorId: result.visitorId,
                }),
                credentials: "include", // 重要：允许携带和接收cookies
            });

            if (r.ok) {
                showLogin = false;
                account = "";
                password = "";

                session.user = await r.json();
                // console.log($state.snapshot(session.user));

                toast.show("登录成功！", "success");
                await invalidate();
            } else {
                var error = await r.json();
                toast.show(error.error, "error");
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
