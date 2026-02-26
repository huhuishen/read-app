<script lang="ts">
    import type { User } from "$lib/models";
    import { formatDuration } from "../../util";

    const {
        user,
    }: {
        user: User;
    } = $props();
</script>

<div class="stats">
    <div>
        <div class="value">{formatDuration(user.readSeconds)}</div>
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
        font-size: 24px;
        /* font-weight: 600//; */
        text-align: center;
    }

    .label {
        color: #888;
        text-align: center;
    }
</style>
