<script lang="ts">
    import { page } from "$app/state";
    import Menu from "$lib/components/user/Menu.svelte";
    import type { User } from "$lib/models";

    interface Props {
        user: Partial<User>;
    }

    let { user }: Props = $props();

    const url = page.url.pathname.endsWith("/summary")
        ? page.url.pathname.slice(0, -"/summary".length)
        : page.url.pathname;

    let show = $state(false);
</script>

<header class="flex content">
    <div class="flex">
        <a class="link" href="/">首页</a>
        <div class="seperator"></div>

        {#if page.url.pathname.endsWith("/summary")}
            <a class="link" href={url}>开始阅读</a>
        {:else}
            <a class="link" href="{url}/summary">作品概况</a>
        {/if}
    </div>
    <div class="flex">
        <Menu {user} />
    </div>
</header>

<!-- <Drawer bind:show size="sm">
    <header class="drawer-header">
        <Button variant="link" onclick={() => (show = false)}>
            <Icon name="chevron-left" size={26} />返回
        </Button>
    </header>
    <div class="flex column g-2 p-3">
        <div class="flex row center g-3">
            <Avatar name={user.name!} size="md"></Avatar>
            <h1 class="name">{user.name}</h1>
        </div>
        <Button
            onclick={() => {
                goto(`/profile/${user.id}`);
            }}>个人中心</Button
        >
        <Button onclick={logout}>退出登录</Button>
    </div>
</Drawer> -->

<style>
    /* .drawer-header {
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 10px;
        background-color: var(--reader-bg-color);
        height: 60px;
        z-index: 2200;
    } */
    header {
        justify-content: space-between;
        background: var(--reader-bg-color);
        height: 60px;
        border-bottom: var(--bg-color) 1px solid;
        z-index: 2000;
    }
</style>
