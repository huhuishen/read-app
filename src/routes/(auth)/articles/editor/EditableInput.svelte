<script lang="ts">
    import { tick } from "svelte";
    import {
        GROUP_MS,
        type Snapshot,
        isGroupableInputType,
        pushSnapshot,
        sameSnapshot,
    } from "./editableShared";

    let {
        value = $bindable(""),
        placeholder = "Input title...",
        disabled = false,
    }: {
        value?: string;
        placeholder?: string;
        disabled?: boolean;
    } = $props();

    let el = $state<HTMLInputElement | null>(null);
    let initialized = false;
    let isComposing = false;
    let suppressSync = false;
    let lastGroupAt = 0;

    let undoStack: Snapshot[] = [];
    let redoStack: Snapshot[] = [];

    function getSnapshot(): Snapshot {
        if (!el) {
            const offset = value.length;
            return { value, start: offset, end: offset };
        }

        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        return { value: el.value, start, end };
    }

    function captureBeforeInput(inputType: string) {
        if (!el || suppressSync) return;
        const now = Date.now();

        if (isGroupableInputType(inputType) && now - lastGroupAt < GROUP_MS) {
            return;
        }

        pushSnapshot(undoStack, getSnapshot());
        lastGroupAt = now;
    }

    function applySnapshot(snapshot: Snapshot) {
        if (!el) return;

        suppressSync = true;
        value = snapshot.value;
        el.value = snapshot.value;

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
        redoStack = [];
    }

    function handleCompositionStart() {
        isComposing = true;
        pushSnapshot(undoStack, getSnapshot());
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
            pushSnapshot(redoStack, current);
        }

        applySnapshot(previous);
    }

    export function redo() {
        if (!el || redoStack.length === 0) return;

        const current = getSnapshot();
        const next = redoStack.pop();
        if (!next) return;

        pushSnapshot(undoStack, current);
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
            undoStack = [getSnapshot()];
            redoStack = [];
            return;
        }

        if (suppressSync) return;
        if (el.value === nextValue) return;

        el.value = nextValue;
        undoStack = [getSnapshot()];
        redoStack = [];
    });
</script>

<div class="editor-wrap">
    <input
        bind:this={el}
        class="editor title-editor"
        {value}
        {placeholder}
        {disabled}
        spellcheck="false"
        onbeforeinput={handleBeforeInput}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        oncompositionstart={handleCompositionStart}
        oncompositionend={handleCompositionEnd}
    />
</div>

<style>
    .editor-wrap {
        padding: 0 4rem;
    }

    .editor {
        width: 100%;
        border: none;
        outline: none;
        color: var(--text-primary);
        background: transparent;
        white-space: pre-wrap;
        word-break: break-word;
        padding: 0;
        margin: 0;
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
