<script lang="ts">
    let {
        name,
        size = "normal",
    }: {
        name: string;
        size?: "sm" | "md" | "lg" | "normal";
    } = $props();
</script>

<div class="flex avatar size-{size}">{name?.slice(0, 1)}</div>

<style>
    .avatar {
        /* border-radius: 50%; */
        color: #fff;
        background-color: var(--header-color);
        justify-content: center;
        cursor: default;
    }
    .size-sm {
        width: 16px;
        height: 16px;
        font-size: 13px;
    }
    .size-normal {
        width: 32px;
        height: 32px;
        font-size: 16px;
    }
    .size-md {
        width: 48px;
        height: 48px;
        font-size: 32px;
    }
    .size-lg {
        width: 96px;
        height: 96px;
        font-size: 48px;
    }
</style>
