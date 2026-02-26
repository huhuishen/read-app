<script lang="ts">
    import type { User } from "$lib/models";

    export let user: Partial<User>;

    function follow() {
        console.log("follow", user.id);
    }

    function message() {
        console.log("message", user.id);
    }
</script>

<div class="actions">
    <button disabled class="primary" on:click={follow}>关注</button>
    <button disabled class="secondary" on:click={message}>私信</button>
</div>

<style>
    .actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 40px;
    }

    button {
        padding: 10px 20px;
        /* border-radius: 999px; */
        cursor: pointer;
    }

    .primary {
        background: #111;
        color: white;
        border: none;
    }

    .secondary {
        background: white;
        border: 1px solid #ddd;
    }
</style>
