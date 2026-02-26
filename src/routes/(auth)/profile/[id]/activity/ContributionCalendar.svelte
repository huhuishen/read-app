<script lang="ts">
    type Day = {
        date: string;
        readMinutes: number;
    };

    let {
        days = [],
        rangeDays = 365,
        showTooltip = true,
    } = $props<{
        days: Day[];
        rangeDays?: number;
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

    function buildFullDays(partialDays: Day[], rangeDays: number): Day[] {
        const map = new Map(partialDays.map((d) => [d.date, d]));

        const result: Day[] = [];

        const today = new Date();

        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date(today);

            d.setDate(today.getDate() - i);

            const date = d.toISOString().slice(0, 10);

            result.push(
                map.get(date) ?? {
                    date,

                    readMinutes: 0,
                },
            );
        }

        return result;
    }
    /*
     * today
     */

    const today = new Date().toISOString().slice(0, 10);

    /*
     * 分组为 month -> days
     */

    function groupByMonth(days: Day[]) {
        const map = new Map<string, Map<string, Day>>();

        for (const day of days) {
            const month = day.date.slice(0, 7);

            if (!map.has(month)) map.set(month, new Map());

            map.get(month)!.set(day.date, day);
        }

        const result: MonthGroup[] = [];

        for (const [month, dayMap] of map) {
            const first = new Date(month + "-01");

            const startDay = first.getDay();

            const last = new Date(first);

            last.setMonth(last.getMonth() + 1);
            last.setDate(0);

            const daysCount = last.getDate();

            const cells: (Day | null)[] = [];

            // padding start

            for (let i = 0; i < startDay; i++) cells.push(null);

            // days

            for (let d = 1; d <= daysCount; d++) {
                const date = month + "-" + String(d).padStart(2, "0");

                cells.push(
                    dayMap.get(date) ?? {
                        date,
                        readMinutes: 0,
                    },
                );
            }

            result.push({
                month,

                label: first.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                }),

                cells,
            });
        }

        return result.sort((a, b) => a.month.localeCompare(b.month));
    }

    type MonthGroup = {
        month: string;

        label: string;

        cells: (Day | null)[];
    };

    const months = $derived(groupByMonth(buildFullDays(days, rangeDays)));

    /*
     * tooltip
     */

    let tooltip = $state({
        visible: false,

        text: "",

        x: 0,

        y: 0,
    });

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",

            month: "short",

            day: "numeric",
        });
    }

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

<div class="calendar">
    {#each months as month}
        <div class="month">
            <div class="month-title">
                {month.label}
            </div>

            <div class="grid">
                <!-- weekday header -->

                <div class="weekday">日</div>
                <div class="weekday">一</div>
                <div class="weekday">二</div>
                <div class="weekday">三</div>
                <div class="weekday">四</div>
                <div class="weekday">五</div>
                <div class="weekday">六</div>

                {#each month.cells as day}
                    {#if day}
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="cell level-{level(
                                day.readMinutes,
                            )} {day.date === today ? 'today' : ''}"
                            onmouseenter={(e) => showTip(e, day)}
                            onmouseleave={hideTip}
                        ></div>
                    {:else}
                        <div class="cell empty"></div>
                    {/if}
                {/each}
            </div>
        </div>
    {/each}
</div>

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
    .calendar {
        display: flex;
        /* justify-content: space-between; */
        flex-wrap: wrap;
        gap: 35px;
    }

    .month {
        /* min-width: 220px; */
    }

    .month-title {
        font-weight: 600;
        margin-bottom: 6px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(7, 20px);
        gap: 3px;
    }

    .weekday {
        font-size: 13px;
        color: #888;
        text-align: center;
    }

    .cell {
        width: 18px;
        height: 18px;
        border-radius: 3px;
        background: #ebedf0;
        transition: transform 0.08s;
    }

    .cell:hover {
        transform: scale(1.2);
    }

    .empty {
        background: transparent;
    }

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

    .today {
        outline: 2px solid #333;
    }

    .tooltip {
        position: fixed;
        background: #111;
        color: white;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
    }
</style>
