<script lang="ts">
    import AdminTabs from "../AdminTabs.svelte";
    import UserTable from "../TableUser.svelte";

    const { data } = $props();
</script>

<svelte:head>
    <title>用户管理</title>
</svelte:head>

<AdminTabs active="users">
    <UserTable {data} />
</AdminTabs>
