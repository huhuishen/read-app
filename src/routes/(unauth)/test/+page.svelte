<script module>
    // 模块作用域：定义命令配置接口
    // 这是命令定义的类型（使用JSDoc标注）
    /**
     * @typedef {Object} EditorCommand
     * @property {string} id - 命令唯一标识
     * @property {string} label - 按钮显示文本/图标
     * @property {string} command - execCommand 名称
     * @property {string} [value] - 可选固定参数值
     * @property {string} [prompt] - 可选，如果需要用户输入，提示文本
     * @property {string} [title] - 按钮提示
     * @property {boolean} [separator] - 是否在之后插入分隔符
     */
</script>

<script lang="ts">
    // Rune 5 语法：使用 runes 模式
    // 需要 Svelte 5 以上版本，并启用 runes
    import { onMount, onDestroy } from "svelte";

    interface EditorCommand {
        id: string;
        label: string;
        command: string;
        value?: string;
        prompt?: string;
        title?: string;
        separator?: boolean;
    }

    // ========== 可自定义的命令配置 ==========
    // 暴露给外部的命令配置属性，允许完全自定义工具栏
    interface Props {
        /** 自定义命令列表，若未提供则使用默认命令集 */
        commands?: EditorCommand[];
        /** 初始内容（HTML字符串） */
        initialContent?: string;
        /** 占位符（当内容为空时显示） */
        placeholder?: string;
        /** 是否显示HTML源码面板 */
        showSource?: boolean;
    }

    let {
        commands = $bindable([]),
        initialContent = "",
        placeholder = "在此输入...",
        showSource = true,
    }: Props = $props();

    // ========== 默认命令集（完全可自定义的范例）==========
    // 作为备用，如果外部未传入commands，则使用此默认配置
    const DEFAULT_COMMANDS: EditorCommand[] = [
        { id: "bold", label: "B", command: "bold", title: "粗体" },
        { id: "italic", label: "I", command: "italic", title: "斜体" },
        { id: "underline", label: "U", command: "underline", title: "下划线" },
        { id: "sep1", label: "|", command: "", separator: true }, // 分隔符

        {
            id: "h2",
            label: "H2",
            command: "formatBlock",
            value: "h2",
            title: "标题2",
        },
        {
            id: "p",
            label: "P",
            command: "formatBlock",
            value: "p",
            title: "正文",
        },
        {
            id: "ul",
            label: "• 列表",
            command: "insertUnorderedList",
            title: "无序列表",
        },
        {
            id: "ol",
            label: "1. 列表",
            command: "insertOrderedList",
            title: "有序列表",
        },
        { id: "sep2", label: "|", command: "", separator: true },

        { id: "left", label: "⬅", command: "justifyLeft", title: "左对齐" },
        { id: "center", label: "⬌", command: "justifyCenter", title: "居中" },
        { id: "right", label: "➡", command: "justifyRight", title: "右对齐" },
        { id: "sep3", label: "|", command: "", separator: true },

        {
            id: "link",
            label: "🔗",
            command: "createLink",
            prompt: "请输入链接URL",
            title: "插入链接",
        },
        {
            id: "image",
            label: "🖼️",
            command: "insertImage",
            prompt: "请输入图片地址",
            title: "插入图片",
        },
        {
            id: "blockquote",
            label: "❝",
            command: "formatBlock",
            value: "blockquote",
            title: "引用",
        },
        {
            id: "code",
            label: "</>",
            command: "formatBlock",
            value: "pre",
            title: "代码块",
        },
        { id: "sep4", label: "|", command: "", separator: true },

        { id: "undo", label: "↩", command: "undo", title: "撤销" },
        { id: "redo", label: "↪", command: "redo", title: "重做" },
        {
            id: "removeFormat",
            label: "清除",
            command: "removeFormat",
            title: "清除格式",
        },
    ];

    // 合并命令：如果外部传入了commands，则使用外部命令，否则使用默认命令
    let activeCommands: EditorCommand[] = $derived(
        commands.length > 0 ? commands : DEFAULT_COMMANDS,
    );

    // ========== 编辑器状态 (Rune 5 响应式) ==========
    let editorRef: HTMLDivElement = $state()!; // 编辑器元素引用
    let htmlSource: string = $state(""); // 实时HTML源码
    let isFocused: boolean = $state(false); // 是否获得焦点

    // ========== 方法：执行富文本命令 ==========
    const executeCommand = (cmd: EditorCommand): void => {
        // 如果是分隔符或无命令，跳过
        if (cmd.separator || !cmd.command) return;

        const { command, value, prompt: promptMsg } = cmd;

        // 需要用户输入的命令
        if (command === "createLink" || command === "insertImage") {
            const defaultUrl = command === "createLink" ? "https://" : "";
            const url = prompt(
                promptMsg ||
                    `请输入${command === "createLink" ? "链接" : "图片"}地址`,
                defaultUrl,
            );
            if (url && url.trim() !== "") {
                document.execCommand(command, false, url.trim());
            }
        } else {
            // 直接执行命令
            document.execCommand(command, false, value);
        }

        // 确保编辑器获得焦点
        editorRef?.focus();
        // 手动更新HTML源码（某些命令不触发input事件）
        updateHtmlSource();
    };

    // ========== 更新HTML源码显示 ==========
    const updateHtmlSource = (): void => {
        if (editorRef) {
            const rawHtml = editorRef.innerHTML;
            // 转义HTML标签以便安全显示
            const escaped = rawHtml
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
                // 简单美化：在块级标签后添加换行
                .replace(/&lt;\/h[1-6]&gt;/g, "&lt;/$&gt;\n")
                .replace(/&lt;\/p&gt;/g, "&lt;/p&gt;\n")
                .replace(/&lt;\/div&gt;/g, "&lt;/div&gt;\n")
                .replace(/&lt;br&gt;/g, "&lt;br&gt;\n");

            htmlSource = escaped;
        }
    };

    // ========== 设置初始内容 ==========
    const setInitialContent = (): void => {
        if (editorRef && initialContent) {
            editorRef.innerHTML = initialContent;
            updateHtmlSource();
        }
    };

    // ========== 生命周期 ==========
    onMount(() => {
        // 设置初始内容
        setInitialContent();

        // 监听编辑器事件
        if (editorRef) {
            editorRef.addEventListener("input", updateHtmlSource);

            // 使用MutationObserver作为备份
            const observer = new MutationObserver(updateHtmlSource);
            observer.observe(editorRef, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });

            // 清理函数
            onDestroy(() => {
                editorRef?.removeEventListener("input", updateHtmlSource);
                observer.disconnect();
            });
        }
    });

    // ========== 暴露方法给父组件（通过$export或回调，此处使用双向绑定模式） ==========
    // 定义可以向外暴露的方法
    const expose = {
        execCommand: (cmd: EditorCommand) => executeCommand(cmd),
        getHTML: () => editorRef?.innerHTML || "",
        setHTML: (html: string) => {
            if (editorRef) {
                editorRef.innerHTML = html;
                updateHtmlSource();
            }
        },
        focus: () => editorRef?.focus(),
    };

    // 使用 $export 将方法暴露给父组件（Svelte 5 rune 语法）
    // $export(expose);
</script>

<!-- ========== 组件模板 ========== -->
<div class="editor-container">
    <!-- 工具栏：动态渲染自定义命令 -->
    <div class="toolbar">
        {#each activeCommands as cmd (cmd.id)}
            {#if cmd.separator}
                <span class="separator" aria-hidden="true"></span>
            {:else}
                <button
                    class="tool-btn"
                    type="button"
                    title={cmd.title || cmd.label}
                    onclick={() => executeCommand(cmd)}
                >
                    {@html cmd.label}
                </button>
            {/if}
        {/each}
    </div>

    <!-- 可编辑区域 -->
    <div
        bind:this={editorRef}
        class="rich-editor"
        contenteditable="true"
        onfocus={() => (isFocused = true)}
        onblur={() => (isFocused = false)}
        {...!initialContent && !editorRef?.innerHTML
            ? { "data-placeholder": placeholder }
            : {}}
    ></div>

    <!-- 可选：实时HTML源码面板 -->
    {#if showSource}
        <div class="source-panel">
            <div class="source-header">
                <span style="font-weight: 600;">📄 实时 HTML 结构</span>
                <span
                    style="font-size: 0.7rem; background: var(--surface-soft); padding: 4px 12px; border-radius: 40px;"
                >
                    编辑即更新
                </span>
            </div>
            <div class="html-content">
                {htmlSource || "&lt;!-- 编辑器内容将显示在此 --&gt;"}
            </div>
        </div>
    {/if}

    <div class="footnote">⚡ SvelteKit Rune 5 · 自建富文本 · 命令可自定义</div>
</div>

<!-- 额外说明：使用 document.execCommand 作为教学演示 -->
<svelte:head>
    <meta
        name="description"
        content="自建富文本编辑器 - SvelteKit Rune 5 版本，支持命令自定义"
    />
</svelte:head>

<!-- 组件样式 - 使用scoped样式，与原始演示保持一致但适配SvelteKit -->
<style>
    .editor-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 900px;
        background: var(--surface-ghost);
        backdrop-filter: blur(4px);
        border-radius: 28px;
        padding: 24px;
        box-shadow: 0 20px 40px -12px var(--shadow-md);
    }

    .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        background: white;
        padding: 12px 16px;
        border-radius: 48px;
        margin-bottom: 18px;
        box-shadow: 0 4px 10px var(--overlay-soft);
        border: 1px solid var(--surface-ghost);
    }

    .tool-btn {
        background: transparent;
        border: none;
        padding: 8px 14px;
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--text-heading);
        border-radius: 40px;
        transition: 0.1s ease;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border: 1px solid transparent;
        letter-spacing: 0.3px;
    }

    .tool-btn:hover {
        background: var(--surface-soft);
        border-color: var(--border-strong);
    }

    .tool-btn:active {
        background: var(--border-strong);
        transform: scale(0.96);
    }

    .separator {
        width: 1px;
        background: var(--border-strong);
        margin: 0 6px;
        display: inline-block;
    }

    /* 编辑器核心区域 */
    .rich-editor {
        background: white;
        border-radius: 24px;
        padding: 28px 32px;
        min-height: 280px;
        border: 1px solid var(--surface-ghost);
        box-shadow:
            inset 0 2px 6px var(--overlay-soft),
            0 8px 20px var(--overlay-soft);
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--text-heading);
        outline: none;
        overflow-y: auto;
        transition:
            border 0.15s,
            box-shadow 0.2s;
    }

    .rich-editor:focus {
        border-color: var(--accent-primary);
        box-shadow:
            inset 0 2px 6px var(--overlay-soft),
            0 0 0 3px var(--accent-tint-soft);
    }

    /* 编辑器内容样式 */
    .rich-editor :global(h1),
    .rich-editor :global(h2),
    .rich-editor :global(h3) {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
        line-height: 1.3;
    }

    .rich-editor :global(ul),
    .rich-editor :global(ol) {
        padding-left: 1.8rem;
    }

    .rich-editor :global(blockquote) {
        border-left: 4px solid var(--border-strong);
        margin: 1rem 0;
        padding-left: 1.2rem;
        color: var(--text-secondary);
        font-style: italic;
    }

    .rich-editor :global(pre) {
        background: var(--surface-soft);
        padding: 0.9rem;
        border-radius: 16px;
        font-family: "JetBrains Mono", "Cascadia Code", monospace;
        font-size: 0.9rem;
        border: 1px solid var(--border-soft);
        overflow-x: auto;
    }

    /* 源码面板 */
    .source-panel {
        margin-top: 24px;
        background: var(--text-heading);
        color: var(--text-secondary);
        border-radius: 20px;
        padding: 16px 22px;
        font-family: "JetBrains Mono", "Fira Code", monospace;
        font-size: 0.8rem;
        border: 1px solid var(--border-default);
        display: flex;
        flex-direction: column;
    }

    .source-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        color: var(--text-muted);
        letter-spacing: 0.5px;
    }

    .html-content {
        word-break: break-word;
        white-space: pre-wrap;
        max-height: 130px;
        overflow-y: auto;
        background: var(--surface-page);
        padding: 12px 16px;
        border-radius: 14px;
        border: 1px solid var(--border-default);
        color: var(--text-secondary);
        font-size: 0.8rem;
    }

    .placeholder {
        color: var(--text-muted);
    }

    .footnote {
        margin-top: 16px;
        text-align: right;
        color: var(--text-muted);
        font-size: 0.75rem;
    }
</style>
