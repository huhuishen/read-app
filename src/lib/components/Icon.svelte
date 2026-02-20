<script lang="ts">
    interface Props {
        name: string;
        width?: number;
        height?: number;
        size?: number;
        color?: string;
        fill?: string;
        className?: string;
        absoluteStrokeWidth?: boolean;
        strokeWidth?: number;
        onclick?: (e: MouseEvent) => void;
        title?: string;
    }

    let {
        name,
        color = "currentColor",
        fill = "none",
        size = 24,
        width,
        height,
        strokeWidth = 2,
        absoluteStrokeWidth = false,
        className,
        onclick,
        title,
    }: Props = $props();

    const finalWidth = $derived(width ?? size ?? 16);
    const finalHeight = $derived(height ?? size ?? 16);

    const computedStrokeWidth = $derived(
        absoluteStrokeWidth ? (strokeWidth * 16) / finalWidth : strokeWidth,
    );
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<svg
    xmlns="http://www.w3.org/2000/svg"
    width={finalWidth}
    height={finalHeight}
    class={className}
    {fill}
    stroke={color}
    stroke-width={computedStrokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    role={onclick ? "button" : undefined}
    aria-hidden={onclick ? undefined : true}
    tabindex={onclick ? 0 : undefined}
    {onclick}
    onkeydown={(e) => {
        if (onclick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onclick(e as unknown as MouseEvent);
        }
    }}
>
    {#if title}
        <title>{title}</title>
    {/if}
    <use href={`#${name}`} />
</svg>
