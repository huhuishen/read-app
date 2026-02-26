<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import type { Underline, UnderlineRange } from "$lib/models/underline";

    let {
        text,
        segment,
        underlines,
        endmark = false,
        onclick,
    }: {
        text: string;
        segment: number;
        underlines: Record<number, UnderlineRange[]>;
        endmark?: boolean;
        onclick?: (
            segment: number,
            underline: UnderlineRange,
            span: HTMLSpanElement,
        ) => void;
    } = $props();

    export function renderTextWithUnderlines(
        text: string,
        ranges: UnderlineRange[] | undefined,
    ) {
        if (!ranges || ranges.length === 0) {
            return [{ text, underline: null }];
        }

        // 保证排序（理论上后端已排序）
        const sorted = [...ranges].sort((a, b) => a.start - b.start);

        const result: { text: string; underline: UnderlineRange | null }[] = [];

        let cursor = 0;

        for (const r of sorted) {
            const start = Math.max(0, Math.min(r.start, text.length));
            const end = Math.max(0, Math.min(r.end, text.length));

            // 普通文本部分
            if (cursor < start) {
                result.push({
                    text: text.slice(cursor, start),
                    underline: null,
                });
            }

            // 下划线部分
            if (start < end) {
                result.push({
                    text: text.slice(start, end),
                    underline: { start, end },
                });
            }

            cursor = end;
        }

        // 末尾剩余文本
        if (cursor < text.length) {
            result.push({
                text: text.slice(cursor),
                underline: null,
            });
        }

        return result;
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions-->
<p class="text-segment" data-segment={segment}>
    {#each renderTextWithUnderlines(text, underlines[segment]) as part}
        {#if part.underline}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span
                class="underlined-text"
                title=""
                onclick={(e) => {
                    e.stopPropagation();
                    const targetEl = e.currentTarget as HTMLSpanElement; // 当前 span 元素
                    onclick?.(segment, part.underline!, targetEl);
                }}
            >
                {part.text}
            </span>
        {:else}
            {part.text}
        {/if}
    {/each}
    {#if endmark}
        <Icon name="alien" size={16} fill="currentColor" strokeWidth={0} />
    {/if}
</p>

<style>
    .text-segment {
        line-height: 2;
        margin-bottom: 1rem;
        position: relative;
        font-size: 20px;
        color: var(--text-color);
    }

    .underlined-text {
        /* text-decoration: underline dotted brown 2px; */
        /* text-decoration: underline solid brown 1px; */
        text-decoration: underline wavy purple 1px;
        /* text-decoration: underline dashed var(--link-color) 1px; */
        text-underline-offset: 10px;
        cursor: pointer;
        /* position: relative; */
    }
</style>
