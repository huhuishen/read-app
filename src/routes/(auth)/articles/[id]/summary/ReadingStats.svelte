<script lang="ts">
    let {
        title = "",
        value = "",
        unit = "",
        subtitle = "",
    }: {
        title?: string;
        value?: string | number;
        unit?: string;
        subtitle?: string;
    } = $props();

    function formatWordCount(count: number): string {
        if (count === undefined || count === null) return "0字";
        // 转换为以“万”为单位
        const countInTenThousand = count / 10000;
        // 保留一位小数，并移除末尾的.0（如果是整数）
        const formatted =
            countInTenThousand % 1 === 0
                ? countInTenThousand.toString()
                : countInTenThousand.toFixed(1);
        return `${formatted}万字`;
    }
</script>

<div class="flex column g-2 state">
    <span class="title">{title}</span>
    <div class="title">
        <span class="strong">{value}</span>
        <span class="">{unit}</span>
    </div>
    <span class="title">{subtitle}</span>
</div>

<style>
    .state {
        min-width: 110px;
        min-height: 150px;
        font-size: 16px;
    }
    .title {
        flex: 0;
    }
    .strong {
        font-size: 28px;
    }
</style>
