<script lang="ts">
    let {
        value = $bindable(""),
        placeholder = "请输入内容...",
    }: {
        value?: string;
        placeholder?: string;
    } = $props();

    let el = $state<HTMLDivElement>();

    // 初始化内容
    // function init() {
    //     if (!el) return;
    //     if (!value) {
    //         el.innerHTML = `<p><br></p>`;
    //     } else {
    //         setText(value);
    //     }
    // }

    // 获取纯文本
    export function getText(): string {
        if (!el) return "";
        return el.innerText.replace(/\n$/, "");
    }

    // 设置纯文本 → 自动转 p
    // export function setText(text: string) {
    //     if (!el) return;

    //     const lines = text.split("\n");

    //     el.innerHTML = lines
    //         .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    //         .join("");
    // }

    let lines = $derived(value.split("\n"));

    function escapeHtml(text: string) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    // 粘贴 → 强制纯文本
    function onPaste(e: ClipboardEvent) {
        e.preventDefault();

        const text = e.clipboardData?.getData("text/plain") ?? "";

        insertTextAtCursor(text);
    }

    // 插入纯文本（保持 p 结构）
    function insertTextAtCursor(text: string) {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;

        const lines = text.split("\n");
        if (lines.length === 0) return;

        insertParagraphAtCursor();

        const range = sel.getRangeAt(0);
        let currentP = range.startContainer;
        while (currentP && (currentP as Element).tagName !== "P") {
            currentP = currentP.parentNode as Node;
        }

        if (!currentP) return;

        const parent = (currentP as HTMLElement).parentNode;
        if (!parent) return;

        const frag = document.createDocumentFragment();

        for (const line of lines) {
            if (line.trim() === "") {
                continue;
            }

            const p = document.createElement("p");
            p.className = "segment";
            p.textContent = line || "";
            if (!line) p.innerHTML = "<br>";
            frag.appendChild(p);
        }

        // 用创建的文档片段替换当前的段落
        parent.replaceChild(frag, currentP);

        // const firstP = frag.firstChild as HTMLElement;
        const lastP = frag.lastChild as HTMLElement;
        if (lastP) {
            const newRange = document.createRange();
            // 将光标移动到第一个新段落的开头
            // newRange.setStart(firstP, 0);
            // newRange.collapse(true);
            // 移动光标到末尾
            // newRange.selectNodeContents(lastP);
            newRange.setStart(lastP, 0);
            newRange.collapse(true);

            sel.removeAllRanges();
            sel.addRange(newRange);
        }
    }

    // 回车 → 始终创建 p
    function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();

            // document.execCommand("insertParagraph");
            insertParagraphAtCursor();
        }
    }

    function insertParagraphAtCursor() {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        const range = selection.getRangeAt(0);

        // 情况1：如果在p元素的末尾，拆分当前p
        if (range.endContainer.nodeType === Node.TEXT_NODE) {
            const textNode = range.endContainer;
            const offset = range.endOffset;
            const parentP = textNode.parentElement;

            if (parentP && parentP.tagName === "P") {
                // 如果光标在文本末尾
                if (offset === textNode.length) {
                    const newP = document.createElement("p");
                    p.className = "segment";
                    newP.innerHTML = "<br>";
                    parentP.parentNode?.insertBefore(newP, parentP.nextSibling);

                    // 移动光标到新p
                    const newRange = document.createRange();
                    newRange.setStart(newP, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    return;
                }

                // 如果光标在文本中间，拆分文本
                const afterText = textNode.splitText(offset);
                const newP = document.createElement("p");
                newP.className = "segment";

                // 将后半部分文本移到新p
                if (afterText.textContent) {
                    newP.textContent = afterText.textContent;
                } else {
                    newP.innerHTML = "<br>";
                }

                parentP.parentNode?.insertBefore(newP, parentP.nextSibling);

                // 移除原p中的后半部分文本
                afterText.remove();

                // 移动光标到新p开头
                const newRange = document.createRange();
                newRange.setStart(newP, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                return;
            }
        }

        // 情况2：如果在p元素的边界
        if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
            const element = range.startContainer as Element;
            if (element.tagName === "P" && range.startOffset === 0) {
                const newP = document.createElement("p");
                newP.className = "segment";
                newP.innerHTML = "<br>";
                element.parentNode?.insertBefore(newP, element);

                const newRange = document.createRange();
                newRange.setStart(newP, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                return;
            }
        }

        // 默认情况：在当前光标位置插入新段落
        const newP = document.createElement("p");
        newP.className = "segment";
        newP.innerHTML = "<br>";

        range.deleteContents();
        range.insertNode(newP);

        // 移动光标到新段落
        const newRange = document.createRange();
        newRange.setStart(newP, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    // $effect(init);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore element_invalid_self_closing_tag -->
<div
    bind:this={el}
    class="content editable"
    contenteditable="true"
    data-placeholder={placeholder}
    onpaste={onPaste}
    onkeydown={onKeyDown}
>
    {#each lines as line}
        <p class="segment">{line || "<br>"}</p>
    {/each}
</div>

<style>
    .editable {
        outline: none;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .editable:empty::before {
        content: attr(data-placeholder);
        color: #999;
        pointer-events: none;
    }
</style>
