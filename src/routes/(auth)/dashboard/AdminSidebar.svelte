<script lang="ts">
    import { page } from "$app/state";
    import Icon from "$lib/components/Icon.svelte";
    import type { User } from "$lib/models";
    import { adminMenu } from "./menu";
    import { hasPermission } from "./permissions";

    const { user } = $props<{
        user: Partial<User>;
    }>();

    const filteredMenu = $derived(
        adminMenu.filter(
            (item) =>
                !item.permission ||
                hasPermission(user.roles as any, item.permission),
        ),
    );
</script>

<aside>
    {#each filteredMenu as item}
        <a
            class="menu-item"
            href={item.href}
            class:active={item.href && page.url.pathname.endsWith(item.href)}
        >
            {#if item.icon}
                <Icon name={item.icon}></Icon>
            {/if}
            <span>{item.label}</span></a
        >
        {#if item.children}
            {#each item.children as subitem}
                <a
                    class="menu-item subitem"
                    href={subitem.href}
                    class:active={item.href &&
                        page.url.pathname.endsWith(item.href)}
                >
                    <span>{subitem.icon}</span>
                    <span>{subitem.label}</span>
                </a>
            {/each}
        {/if}
    {/each}
</aside>

<style>
    aside {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        background: white;
        /* border-right: 1px solid #eee; */
        /* transition: width 0.2s ease; */
        /* height: 100vh; */
        overflow-y: auto;
    }
    @media (max-width: 1200px) {
        aside {
        flex-direction: row;
        }
    }
    .menu-item {
        padding: 12px 16px;
        display: flex;
        gap: 12px;
        cursor: pointer;
    }
    .subitem {
        margin-left: 2rem;
    }
    .active {
        background-color: #eee;
    }
    .menu-item:hover {
        background: #f0f2f5;
    }
</style>
