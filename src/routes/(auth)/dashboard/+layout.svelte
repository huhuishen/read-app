<script lang="ts">
    import AdminSidebar from "./AdminSidebar.svelte";

    const { data, children } = $props();

    const user = $derived(data.user);
</script>

<div class="profile-container">
    <div class="layout">
        <aside class="side">
            <AdminSidebar {user} />
        </aside>
        <div class="main">
            {@render children?.()}
        </div>
    </div>
</div>

<style>
    .profile-container {
        /* max-width: 1630px; */
        margin: 0 auto;
        /* padding: 0 30px; */
        font-size: 16px;
    }

    .layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        /* gap: 32px; */
    }

    .main {
        min-width: 0;
        /* font-size: 13px; */
    }

    .side {
        /* height: fit-content; */
        background-color: white;
        border-right: 1px solid #ccc;
        /* padding: 1rem; */
    }

    @media (max-width: 1200px) {
        /* .profile-container {
            padding: 0;
        } */
        .layout {
            grid-template-columns: 1fr;
        }

        .side {
            position: static;
            height: fit-content;
        }
    }
</style>
