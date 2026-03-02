<script lang="ts">
    // ✅ Svelte 5 Props（支持 bind:tags）
    let {
        tags = $bindable<string[]>([]),
        suggestions = [],
        locked = [],
        placeholder = "输入标签后回车",
        readonly = false,
        max = Infinity,
    }: {
        tags?: string[];
        suggestions?: string[]; // ✅ 候选标签池
        locked?: string[]; // ✅ 锁定标签集合
        placeholder?: string;
        readonly?: boolean;
        max?: number;
    } = $props();

    // ✅ 输入框内部状态
    let input = $state("");
    // ✅ 下拉是否展开
    let open = $state(false);

    // ✅ 当前高亮索引（键盘 ↑ ↓ 使用）
    let activeIndex = $state(0);

    // ✅ 点击外部关闭
    function closeDropdown() {
        open = false;
        activeIndex = 0;
    }
    // ✅ 是否还能继续添加
    const canAdd = $derived(() => tags.length < max);

    const filtered = $derived(() => {
        const key = input.toLowerCase();
        return suggestions.filter(
            (t) => t.toLowerCase().includes(key) && !tags.includes(t),
        );
    });

    function addTag(value?: string) {
        if (readonly) return;

        const val = (value ?? input).trim();
        if (!val) return;
        if (tags.includes(val)) {
            input = "";
            closeDropdown();
            return;
        }
        if (!canAdd()) return;

        tags = [...tags, val];
        input = "";
        closeDropdown();
    }

    function removeTag(index: number) {
        if (readonly) return;

        const tag = tags[index];
        if (locked.includes(tag)) return; // ✅ 锁定标签不可删

        tags = tags.toSpliced(index, 1);
    }

    function onKey(e: KeyboardEvent) {
        if (!open && e.key === "ArrowDown") {
            open = true;
            activeIndex = 0;
            return;
        }

        if (!open && e.key === "Enter") {
            e.preventDefault();
            addTag();
            return;
        }

        if (!open) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % filtered().length;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex =
                (activeIndex - 1 + filtered().length) % filtered().length;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            addTag(filtered()[activeIndex]);
        }

        if (e.key === "Escape") {
            closeDropdown();
        }

        // ✅ 原有：Backspace 删除最后一个
        if (e.key === "Backspace" && input === "" && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    }
</script>

<div class="tags {readonly ? 'readonly' : ''}">
    {#each tags as tag, i}
        <span class="tag">
            {tag}

            {#if locked.includes(tag)}
                <span style="opacity:.5">🔒</span>
            {:else if !readonly}
                <button
                    type="button"
                    class="remove"
                    aria-label="移除标签"
                    onclick={() => removeTag(i)}>×</button
                >
            {/if}
        </span>
    {/each}

    <div class="input-wrapper" onfocusin={() => (open = true)}>
        <input bind:value={input} {placeholder} onkeydown={onKey} />

        {#if open && input && filtered().length > 0}
            <div class="dropdown">
                {#each filtered().slice(0, 6) as item, i}
                    <button
                        type="button"
                        class="option {i === activeIndex ? 'active' : ''}"
                        onclick={() => addTag(item)}
                    >
                        {item}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .tags {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px;
        border: 1px solid var(--border-default);
        border-radius: 8px;
        background: var(--main-bg-color);
    }

    .tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--surface-soft);
        color: var(--text-primary);
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 13px;
    }

    .remove {
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        font-weight: bold;
        opacity: 0.6;
    }

    .remove:hover {
        opacity: 1;
    }

    input {
        border: none;
        outline: none;
        flex: 1;
        min-width: 120px;
        font-size: 14px;
    }
    .input-wrapper {
        position: relative;
        flex: 1;
        min-width: 140px;
    }
    .readonly {
        opacity: 0.6;
    }

    .dropdown {
        position: absolute;
        left: 0;
        top: 100%;
        margin-top: 4px;

        width: 100%;
        max-height: 210px; /* ✅ 6 条高度限制 */
        overflow-y: auto; /* ✅ 滚动 */

        background: var(--main-bg-color);
        border: 1px solid var(--border-default);
        border-radius: 8px;
        z-index: 100;
        box-shadow: 0 4px 12px var(--shadow-sm);
    }

    .option {
        width: 100%;
        border: none;
        background: transparent;
        text-align: left;
        padding: 8px 10px;
        font-size: 13px;
        cursor: pointer;
        border-radius: 6px;
    }

    .option:hover,
    .option.active {
        background: #e9f0ff; /* ✅ hover + 键盘高亮 */
    }
</style>
