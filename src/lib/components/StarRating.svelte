<script lang="ts">
    import Icon from "./Icon.svelte";

    // ✅ Svelte 5 Props（带双向绑定）
    let {
        value = $bindable(0), // 评分值：支持 bind:value
        max = 5,
        step = 0.5,
        size = 24,
        readonly = false,
    }: {
        value?: number;
        max?: number;
        step?: number;
        size?: number;
        readonly?: boolean;
    } = $props();

    // ✅ 组件内部状态
    let preview = $state<number | null>(null);

    // ✅ 当前展示值（替代 $:）
    const displayValue = $derived(() => (preview === null ? value : preview));

    // ✅ 计算单个星的填充百分比（0 / 50 / 100）
    function fillFor(index: number) {
        const remain = displayValue() - (index - 1);
        if (remain <= 0) return 0;
        if (remain >= 1) return 100;
        return remain * 100; // 0.5 => 50
    }

    // ✅ 鼠标位置决定半星 or 整星
    function computeFromPointer(e: MouseEvent, index: number) {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;

        const raw = x < rect.width / 2 ? index - 0.5 : index;

        return Math.min(max, Math.max(0, Math.round(raw / step) * step));
    }

    function onMove(e: MouseEvent, index: number) {
        if (readonly) return;
        preview = computeFromPointer(e, index);
    }

    function onLeave() {
        preview = null;
    }

    function onClick(e: MouseEvent, index: number) {
        if (readonly) return;
        value = computeFromPointer(e, index);
    }

    // ✅ 键盘无障碍支持
    function onKey(e: KeyboardEvent) {
        if (readonly) return;

        if (e.key === "ArrowRight") value = Math.min(max, value + step);
        if (e.key === "ArrowLeft") value = Math.max(0, value - step);
        if (e.key === "Home") value = 0;
        if (e.key === "End") value = max;
    }
</script>

<div
    class="rating"
    tabindex="0"
    role="slider"
    aria-valuemin="0"
    aria-valuemax={max}
    aria-valuenow={value}
    onkeydown={onKey}
    onmouseleave={onLeave}
>
    {#each Array(max) as _, i}
        <button
            class="star-btn"
            style={`--size:${size}px`}
            onmousemove={(e) => onMove(e, i + 1)}
            onclick={(e) => onClick(e, i + 1)}
            disabled={readonly}
        >
            <div class="wrapper">
                <!-- ✅ 填充层（支持 0~50~100%） -->
                <div class="fill" style={`width:${fillFor(i + 1)}%`}>
                    <Icon name="star" {size} fill="currentColor" />
                </div>

                <!-- ✅ 灰色轮廓层 -->
                <div class="outline">
                    <Icon name="star" {size} />
                </div>
            </div>
        </button>
    {/each}
</div>

<style>
    .rating {
        display: inline-flex;
        gap: 6px;
    }

    .star-btn {
        background: none;
        border: none;
        padding: 0;
        position: relative;
        cursor: default;
    }

    .star-btn:hover {
        background: none;
    }

    .wrapper {
        position: relative;
        width: var(--size);
        height: var(--size);
    }

    .fill {
        position: absolute;
        overflow: hidden;
        top: 0;
        left: 0;
        height: 100%;
        color: #f6b024;
    }

    .outline {
        color: #ccc;
    }
</style>
