<script lang="ts">
    import { tick } from "svelte";

    type Snapshot = {
        value: string;
        start: number;
        end: number;
    };

    let {
        value = $bindable(""),
        variant = "content",
        placeholder,
        disabled = false,
        minHeight,
    }: {
        value?: string;
        variant?: "title" | "content";
        placeholder?: string;
        disabled?: boolean;
        minHeight?: number;
    } = $props();

    const isTitle = $derived(variant === "title");
    const resolvedPlaceholder = $derived.by(() =>
        placeholder ?? (variant === "title" ? "Input title..." : "Start writing..."),
    );
    const resolvedMinHeight = $derived.by(() =>
        minHeight ?? (variant === "title" ? 0 : 360),
    );

    const HISTORY_LIMIT = 300;
    const GROUP_MS = 900;

    let el: HTMLTextAreaElement | HTMLInputElement | null = null;
    let initialized = false;
    let isComposing = false;
    let suppressSync = false;
    let lastGroupAt = 0;

    let undoStack: Snapshot[] = [];
    let redoStack: Snapshot[] = [];

    function sameSnapshot(a: Snapshot | undefined, b: Snapshot) {
        return !!a && a.value === b.value && a.start === b.start && a.end === b.end;
    }

    function getSnapshot(): Snapshot {
        if (!el) {
            const offset = value.length;
            return { value, start: offset, end: offset };
        }

        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;

        return { value: el.value, start, end };
    }

    function pushUndo(snapshot: Snapshot) {
        const last = undoStack.at(-1);
        if (sameSnapshot(last, snapshot)) return;

        undoStack.push(snapshot);
        if (undoStack.length > HISTORY_LIMIT) {
            undoStack.shift();
        }
    }

    function captureBeforeInput(inputType: string) {
        if (!el || suppressSync) return;

        const isGroupable =
            inputType === "insertText" ||
            inputType === "deleteContentBackward" ||
            inputType === "deleteContentForward" ||
            inputType === "insertCompositionText";

        const now = Date.now();
        if (isGroupable && now - lastGroupAt < GROUP_MS) return;

        pushUndo(getSnapshot());
        lastGroupAt = now;
    }

    function applySnapshot(snapshot: Snapshot) {
        if (!el) return;

        suppressSync = true;
        value = snapshot.value;
        el.value = snapshot.value;
        autoResize();

        tick().then(() => {
            if (!el) {
                suppressSync = false;
                return;
            }

            const max = el.value.length;
            el.setSelectionRange(
                Math.min(snapshot.start, max),
                Math.min(snapshot.end, max),
            );
            suppressSync = false;
        });
    }

    function autoResize() {
        if (!el || isTitle) return;
        el.style.height = "auto";
        el.style.height = `${Math.max(resolvedMinHeight, el.scrollHeight)}px`;
    }

    function handleBeforeInput(e: InputEvent) {
        if (disabled) {
            e.preventDefault();
            return;
        }

        if (isComposing) return;
        captureBeforeInput(e.inputType);
    }

    function handleInput() {
        if (!el) return;

        value = el.value;
        autoResize();
        redoStack = [];
    }

    function handleCompositionStart() {
        isComposing = true;
        pushUndo(getSnapshot());
    }

    function handleCompositionEnd() {
        isComposing = false;
        handleInput();
    }

    function handleKeyDown(e: KeyboardEvent) {
        const ctrl = e.ctrlKey || e.metaKey;
        if (!ctrl) return;

        const key = e.key.toLowerCase();

        if (key === "z") {
            e.preventDefault();
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
            return;
        }

        if (key === "y") {
            e.preventDefault();
            redo();
        }
    }

    export function undo() {
        if (!el || undoStack.length === 0) return;

        const current = getSnapshot();
        const previous = undoStack.pop();
        if (!previous) return;

        const lastRedo = redoStack.at(-1);
        if (!sameSnapshot(lastRedo, current)) {
            redoStack.push(current);
            if (redoStack.length > HISTORY_LIMIT) {
                redoStack.shift();
            }
        }

        applySnapshot(previous);
    }

    export function redo() {
        if (!el || redoStack.length === 0) return;

        const current = getSnapshot();
        const next = redoStack.pop();
        if (!next) return;

        pushUndo(current);
        applySnapshot(next);
    }

    export function focus() {
        el?.focus();
    }

    $effect(() => {
        if (!el) return;

        const nextValue = value ?? "";
        if (!initialized) {
            initialized = true;
            el.value = nextValue;
            autoResize();
            undoStack = [getSnapshot()];
            redoStack = [];
            return;
        }

        if (suppressSync) return;
        if (el.value === nextValue) return;

        el.value = nextValue;
        autoResize();
        undoStack = [getSnapshot()];
        redoStack = [];
    });
</script>

<div class="editor-wrap">
    {#if isTitle}
        <input
            bind:this={el}
            class="editor title-editor"
            value={value}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            spellcheck="false"
            onbeforeinput={handleBeforeInput}
            oninput={handleInput}
            onkeydown={handleKeyDown}
            oncompositionstart={handleCompositionStart}
            oncompositionend={handleCompositionEnd}
        />
    {:else}
        <textarea
            bind:this={el}
            class="editor content-editor"
            value={value}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            spellcheck="false"
            onbeforeinput={handleBeforeInput}
            oninput={handleInput}
            onkeydown={handleKeyDown}
            oncompositionstart={handleCompositionStart}
            oncompositionend={handleCompositionEnd}
        ></textarea>
    {/if}
</div>

<style>
    .editor-wrap {
        padding: 0 4rem;
    }

    .editor {
        width: 100%;
        border: none;
        outline: none;
        resize: none;
        overflow: hidden;
        color: var(--text-primary);
        background: transparent;
        white-space: pre-wrap;
        word-break: break-word;
        padding: 0;
        margin: 0;
    }

    .content-editor {
        min-height: 360px;
        font-size: 18px;
        line-height: 1.75;
    }

    .title-editor {
        font-size: 38px;
        line-height: 1.25;
        font-weight: 700;
        color: var(--header-color);
        margin-bottom: 0.75rem;
    }

    .editor::placeholder {
        color: var(--link-disabled);
    }
</style>
