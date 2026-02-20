<script lang="ts">
    /**
     * Checkbox 组件 Props 定义
     */
    interface CheckboxProps {
        /** 是否选中（支持 bind） */
        checked?: boolean;

        /** 是否禁用 */
        disabled?: boolean;

        readonly?: boolean;

        /** 半选状态（如全选框） */
        indeterminate?: boolean;

        /** 文本标签 */
        label?: string;

        /** 原生 name，用于表单提交 */
        name?: string;

        /** 原生 value */
        value?: string;
    }

    /**
     * 使用 Svelte 5 rune 获取 props
     */
    let {
        checked = $bindable(false),
        disabled = false,
        readonly = false,
        indeterminate = false,
        label,
        name,
        value,
    }: CheckboxProps = $props();

    /**
     * 计算 checkbox 的视觉状态
     */
    const state = $derived.by(() => {
        if (indeterminate) return "indeterminate";
        return checked ? "checked" : "unchecked";
    });

    const ariaChecked = $derived.by<boolean | "mixed">(() => {
        if (indeterminate) return "mixed";
        return checked;
    });

    /**
     * 点击切换状态
     */
    function toggle() {
        if (disabled) return;
        checked = !checked;
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<label
    class="checkbox"
    class:disabled
    class:checked={state === "checked"}
    class:indeterminate={state === "indeterminate"}
    onclick={(e) => {
        if (readonly) e.preventDefault();
        // e.stopPropagation();
    }}
>
    <!-- 隐藏原生 input，保留语义与表单能力 -->
    <input
        type="checkbox"
        bind:checked
        {name}
        {value}
        {disabled}
        tabindex={readonly ? -1 : 0}
        aria-checked={ariaChecked}
    />

    <!-- 自定义方框 -->
    <span class="box">
        {#if state === "checked"}
            <!-- 勾 -->
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8.5l3 3L13 4" />
            </svg>
        {:else if state === "indeterminate"}
            <!-- 横线 -->
            <span class="dash"></span>
        {/if}
    </span>

    {#if label}
        <span class="label">{label}</span>
    {/if}
</label>

<style>
    /* ===== 主题变量 ===== */
    :root {
        --cb-size: 18px;
        --cb-radius: 3px;
    }

    .checkbox {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        user-select: none;
    }

    .checkbox.disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    /* 隐藏原生 input */
    input {
        position: absolute;
        opacity: 0;
    }

    .box {
        width: var(--cb-size);
        height: var(--cb-size);
        border-radius: var(--cb-radius);
        border: 2px solid var(--button-primary);
        background: var(--control-bg-color);
        display: grid;
        place-items: center;
        position: relative;
    }

    .box svg,
    .box .dash {
        position: absolute; /* ❗完全脱离行盒 */
        inset: 0;
        margin: auto;
        display: block;
    }

    /* hover / focus */
    .checkbox:not(.disabled):hover .box {
        border-color: var(--button-primary);
    }

    .checkbox:focus-within .box {
        box-shadow: 0 0 0 3px
            color-mix(in srgb, var(--button-primary) 25%, transparent);
    }

    /* 选中 */
    .checkbox.checked .box,
    .checkbox.indeterminate .box {
        background: var(--button-primary);
        border-color: var(--button-primary);
    }

    svg {
        width: 12px;
        height: 12px;
        stroke: white;
        stroke-width: 2.5;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        animation: pop 0.15s ease-out;
    }

    .dash {
        width: 10px;
        height: 2px;
        background: white;
        border-radius: 2px;
    }

    .label {
        line-height: 1;
    }

    @keyframes pop {
        from {
            transform: scale(0.7);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
</style>
