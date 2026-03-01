<script lang="ts">
    import { goto } from "$app/navigation";
    import LoginModal from "$lib/components/LoginModal.svelte";
    import type { User } from "$lib/models";
    import { session } from "$lib/stores/session.svelte";
    import { toast } from "$lib/stores/toast.svelte.js";
    import { createApi, safeCall } from "$lib/util/apiRequest";
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
    const api = createApi();

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
            const r = await safeCall(
                api.post("/api/users/register", {
                    account,
                    name: nickname,
                    password,
                }),
                toast,
            );

            if (r) {
                password = "";
                toast.show("注册成功！", "success");
                register = false;
            }
        } else {
            // const fp = await FingerprintJS.load();
            // const result = await fp.get();
            // console.log(result);

            const r = await safeCall<User>(
                api.post("/api/users/auth", {
                    account,
                    password,
                    // visitorId: result.visitorId,
                }),
                toast,
            );

            if (r) {
                showLogin = false;
                account = "";
                password = "";

                session.user = r;
                // console.log($state.snapshot(session.user));

                toast.show("登录成功！", "success");
                await invalidate();
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
