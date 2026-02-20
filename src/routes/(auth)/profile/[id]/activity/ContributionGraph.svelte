<script lang="ts">
    type Day = {
        date: string; // YYYY-MM-DD
        readMinutes: number;
    };

    let { days = [], showTooltip = true } = $props<{
        days: Day[];
        showTooltip?: boolean;
    }>();

    /*
     * 等级映射
     */

    function level(min: number) {
        if (min <= 0) return 0;
        if (min < 10) return 1;
        if (min < 30) return 2;
        if (min < 60) return 3;
        return 4;
    }

    /*
     * 格式化日期
     */

    function formatDate(date: string) {
        const d = new Date(date);

        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    /*
     * 转换为周结构
     */

    function buildWeeks(days: Day[]) {
        if (!days.length) return [];

        const map = new Map(days.map((d) => [d.date, d]));

        const first = new Date(days[0].date);
        const last = new Date(days[days.length - 1].date);

        const start = new Date(first);
        start.setDate(start.getDate() - start.getDay());

        const end = new Date(last);
        end.setDate(end.getDate() + (6 - end.getDay()));

        const weeks: Day[][] = [];

        const cur = new Date(start);

        while (cur <= end) {
            const week: Day[] = [];

            for (let i = 0; i < 7; i++) {
                const key = cur.toISOString().slice(0, 10);

                week.push(
                    map.get(key) ?? {
                        date: key,
                        readMinutes: 0,
                    },
                );

                cur.setDate(cur.getDate() + 1);
            }

            weeks.push(week);
        }

        return weeks;
    }

    /*
     * 月份标签
     */

    function buildMonths(weeks: Day[][]) {
        const months: { name: string; index: number }[] = [];

        let lastMonth = -1;

        weeks.forEach((week, i) => {
            const d = new Date(week[0].date);

            const m = d.getMonth();

            if (m !== lastMonth) {
                months.push({
                    name: d.toLocaleDateString(undefined, {
                        month: "short",
                    }),
                    index: i,
                });

                lastMonth = m;
            }
        });

        return months;
    }

    const weeks = $derived(buildWeeks(days));

    const months = $derived(buildMonths(weeks));

    /*
     * tooltip state
     */

    let tooltip = $state({
        visible: false,
        text: "",
        x: 0,
        y: 0,
    });

    function showTip(e: MouseEvent, day: Day) {
        if (!showTooltip) return;

        tooltip.visible = true;

        tooltip.text = `${formatDate(day.date)} · ${day.readMinutes} min`;

        tooltip.x = e.clientX;
        tooltip.y = e.clientY;
    }

    function hideTip() {
        tooltip.visible = false;
    }
</script>

<div class="contribution-container">
    <!-- 月份 -->

    <div class="months">
        {#each months as m}
            <div class="month" style="grid-column: {m.index + 1}">
                {m.name}
            </div>
        {/each}
    </div>

    <!-- graph -->

    <div class="graph">
        {#each weeks as week}
            <div class="week">
                {#each week as day}
                    <div
                        class="cell level-{level(day.readMinutes)}"
                        onmouseenter={(e) => showTip(e, day)}
                        onmouseleave={hideTip}
                    />
                {/each}
            </div>
        {/each}
    </div>
</div>

<!-- tooltip -->

{#if tooltip.visible}
    <div
        class="tooltip"
        style="
            left:{tooltip.x}px;
            top:{tooltip.y - 28}px;
        "
    >
        {tooltip.text}
    </div>
{/if}

<style>
    .contribution-container {
        position: relative;

        font-size: 12px;
    }

    /* months */

    .months {
        display: grid;

        grid-template-columns: repeat(auto-fit, 14px);

        gap: 4px;

        margin-left: 30px;

        margin-bottom: 6px;

        color: #666;
    }

    .month {
        grid-row: 1;
    }

    /* graph */

    .graph {
        display: flex;

        gap: 4px;
    }

    .week {
        display: flex;

        flex-direction: column;

        gap: 4px;
    }

    /* cells */

    .cell {
        width: 12px;
        height: 12px;

        border-radius: 2px;

        background: #ebedf0;

        transition:
            transform 0.08s ease,
            background 0.15s ease;
    }

    .cell:hover {
        transform: scale(1.2);
    }

    /* levels */

    .level-0 {
        background: #ebedf0;
    }

    .level-1 {
        background: #9be9a8;
    }

    .level-2 {
        background: #40c463;
    }

    .level-3 {
        background: #30a14e;
    }

    .level-4 {
        background: #216e39;
    }

    /* tooltip */

    .tooltip {
        position: fixed;

        background: #111;

        color: white;

        padding: 6px 8px;

        border-radius: 6px;

        font-size: 12px;

        pointer-events: none;

        white-space: nowrap;

        z-index: 1000;
    }
</style>
