<script lang="ts">
    let { value = $bindable(""), placeholder = "输入标题..." } = $props();

    let el: HTMLHeadingElement;
    let isComposing = false;

    function handleInput() {
        if (isComposing) return;

        const text = (el.textContent ?? "").replace(/\n/g, "");

        if (text !== value) {
            value = text;
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    }

    function handlePaste(e: ClipboardEvent) {
        e.preventDefault();

        const text =
            e.clipboardData?.getData("text/plain").replace(/[\r\n]+/g, " ") ??
            "";

        insertTextAtCursor(text);
    }

    function insertTextAtCursor(text: string) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // 删除选中内容
        range.deleteContents();

        // 插入文本节点
        const node = document.createTextNode(text);
        range.insertNode(node);

        // 移动光标到末尾
        range.setStartAfter(node);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        handleInput();
    }

    function compositionStart() {
        isComposing = true;
    }

    function compositionEnd() {
        isComposing = false;
        handleInput();
    }

    // 保持 DOM 与 value 同步（避免光标跳动）
    $effect(() => {
        if (!el) return;

        if (el.textContent !== value) {
            el.textContent = value;
        }
    });
</script>

<div class="content title mb-3">
    <h1
        bind:this={el}
        class="editable"
        contenteditable="true"
        data-placeholder={placeholder}
        spellcheck="false"
        oninput={handleInput}
        onkeydown={handleKeyDown}
        onpaste={handlePaste}
        oncompositionstart={compositionStart}
        oncompositionend={compositionEnd}
    ></h1>
</div>

<style>
    .editable {
        outline: none;
        white-space: nowrap;
    }

    /* placeholder */
    .editable:empty::before {
        content: attr(data-placeholder);
        color: #999;
        pointer-events: none;
    }

    .title h1 {
        color: var(--header-color);
        font-weight: 600;
        font-size: 32px;
        color: var(--header-color);
        font-family: "Times New Roman", Times, serif;
        height: 40px;
        vertical-align: bottom;
    }
</style>
