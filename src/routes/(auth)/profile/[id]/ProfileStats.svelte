<script lang="ts">
    import type { User } from "$lib/models";
    import { formatDurationWithUnit } from "../../../util";

    const {
        user,
    }: {
        user: User;
    } = $props();

    // svelte-ignore state_referenced_locally
        const { value, unit } = formatDurationWithUnit(user.readSeconds);
</script>

<div class="stats">
    <div>
        <div class="value">{value} <small>{unit}</small></div>
        <div class="label">阅读时长</div>
    </div>
    <div>
        <div class="value">{user.commentCount ?? 0}</div>
        <div class="label">评论数</div>
    </div>
    <div>
        <div class="value">{user.underlineCount ?? 0}</div>
        <div class="label">划线数</div>
    </div>

    <!-- <div>
        <div class="value">{stats.followers}</div>
        <div class="label">粉丝</div>
    </div>

    <div>
        <div class="value">{stats.reads}</div>
        <div class="label">阅读</div>
    </div> -->
</div>

<style>
    .stats {
        display: flex;
        justify-content: center;
        gap: 48px;
        margin-bottom: 32px;
    }

    .value {
        font-size: 20px;
        /* font-weight: 600//; */
        text-align: center;
    }

    small {
        font-size: 13px;
    }

    .label {
        color: var(--link-color);
        text-align: center;
    }
</style>
