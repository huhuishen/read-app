<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    type Segment = {
        id: string;
        text: string;
    };

    let {
        segments = $bindable<Segment[]>(),
        editable = true,
        placeholder = "开始输入...",
    } = $props();

    let container: HTMLDivElement;

    let observer: MutationObserver;

    let segmentMap = new Map<string, Segment>();

    function initMap() {
        segmentMap.clear();
        for (const seg of segments) {
            segmentMap.set(seg.id, seg);
        }
    }

    onMount(() => {
        initMap();
        setupObserver();
        normalizeDOM();
    });

    onDestroy(() => {
        observer?.disconnect();
    });

    function setupObserver() {
        observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.type === "characterData") {
                    const p = m.target.parentElement as HTMLParagraphElement;
                    if (!p?.dataset.id) continue;

                    updateSegment(p);
                }

                if (m.type === "childList") {
                    for (const node of m.addedNodes) {
                        if (node instanceof HTMLParagraphElement) {
                            ensureParagraph(node);
                            updateSegment(node);
                        }
                    }
                }
            }
        });

        observer.observe(container, {
            subtree: true,
            characterData: true,
            childList: true,
        });
    }

    function updateSegment(p: HTMLParagraphElement) {
        const id = p.dataset.id!;
        const text = p.textContent ?? "";

        const seg = segmentMap.get(id);

        if (!seg) return;

        if (seg.text !== text) {
            seg.text = text;
            segments = [...segments];
        }
    }

    function normalizeDOM() {
        if (!container) return;

        // 只处理 container 的直接子节点
        const children = Array.from(container.childNodes);

        for (const node of children) {
            // 安全检查：必须仍然属于 container
            if (node.parentNode !== container) continue;

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? "";

                // 空文本直接删除
                if (!text.trim()) {
                    container.removeChild(node);
                    continue;
                }

                const p = createParagraph(text);

                container.replaceChild(p, node);

                continue;
            }

            if (node instanceof HTMLElement && node.tagName !== "P") {
                const text = node.textContent ?? "";

                const p = createParagraph(text);

                container.replaceChild(p, node);

                continue;
            }

            if (node instanceof HTMLParagraphElement) {
                ensureParagraph(node);

                // 防止空段落不可编辑
                if (!node.textContent) {
                    node.textContent = "\u200B";
                }
            }
        }
    }

    function wrapTextNode(node: Node) {
        const p = createParagraph(node.textContent ?? "");

        const parent = node.parentNode;

        if (parent) {
            parent.replaceChild(p, node);
        }
    }

    function convertToParagraph(el: HTMLElement) {
        const p = createParagraph(el.textContent ?? "");
        el.replaceWith(p);
    }

    function ensureParagraph(p: HTMLParagraphElement) {
        if (!p.dataset.id) {
            p.dataset.id = crypto.randomUUID();
        }
    }

    function handleBeforeInput(e: InputEvent) {
        if (!editable) {
            e.preventDefault();
            return;
        }

        if (e.inputType === "insertParagraph") {
            e.preventDefault();
            insertParagraph();
            return;
        }

        if (e.inputType === "insertFromPaste") {
            e.preventDefault();

            const text = (e as any).dataTransfer?.getData("text/plain") ?? "";

            insertText(text);
        }
    }

    function getPlainText(e: InputEvent) {
        const dt = (e as any).dataTransfer;
        if (!dt) return "";

        return dt.getData("text/plain");
    }

    function insertText(text: string) {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        const clean = text.replace(/\r/g, "");

        const lines = clean.split("\n");

        const range = selection.getRangeAt(0);
        range.deleteContents();

        let currentNode: Node | null = null;

        lines.forEach((line, i) => {
            if (i > 0) {
                const p = createParagraph("");
                range.insertNode(p);
                range.setStart(p, 0);
            }

            const node = document.createTextNode(line);
            range.insertNode(node);

            currentNode = node;
            range.setStartAfter(node);
        });

        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function insertParagraph() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // 找到当前段落
        const currentP = findParentParagraph(range.startContainer);

        if (!currentP) {
            // 没有段落 → 创建一个
            const p = createParagraph("\u200B");
            container.appendChild(p);
            moveCursorToStart(p);
            return;
        }

        // 分裂当前段落
        const afterRange = range.cloneRange();

        afterRange.setEndAfter(currentP.lastChild ?? currentP);

        const fragment = afterRange.extractContents();

        // 创建新段落
        const newP = createParagraph("");

        // 将分裂后的内容放入新段落
        newP.appendChild(fragment);

        // 如果新段落为空，插入占位符
        if (!newP.textContent) {
            newP.textContent = "\u200B";
        }

        // 插入到当前段落之后
        currentP.parentNode!.insertBefore(newP, currentP.nextSibling);

        moveCursorToStart(newP);

        updateSegment(currentP);
        updateSegment(newP);
    }

    function findParentParagraph(node: Node): HTMLParagraphElement | null {
        while (node && node !== container) {
            if (node instanceof HTMLParagraphElement) {
                return node;
            }
            node = node.parentNode!;
        }
        return null;
    }

    function moveCursorToStart(el: HTMLElement) {
        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();

        range.selectNodeContents(el);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    function createParagraph(text: string) {
        const id = crypto.randomUUID();

        const p = document.createElement("p");
        p.dataset.id = id;

        // 空段落必须有占位符
        p.textContent = text || "\u200B";

        const seg = { id, text: text || "" };

        segmentMap.set(id, seg);

        segments = [...segments, seg];

        return p;
    }
</script>

<div
    bind:this={container}
    class="content editable"
    contenteditable={editable}
    data-placeholder={placeholder}
    onbeforeinput={handleBeforeInput}
>
    {#each segments as seg (seg.id)}
        <p data-id={seg.id}>
            {seg.text}
        </p>
    {/each}
</div>

<style>
    .content.editable {
        outline: none;
    }

    .content.editable p {
        margin: 0 0 1em 0;
    }

    /* placeholder */
    .content.editable:empty::before {
        content: attr(data-placeholder);
        color: #999;
    }
</style>
