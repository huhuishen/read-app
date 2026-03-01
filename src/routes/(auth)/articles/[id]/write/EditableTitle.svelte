<script lang="ts">
    type Snapshot = {
        value: string;
        start: number;
        end: number;
    };

    let { value = $bindable(""), placeholder = "Input title..." } = $props();

    const HISTORY_LIMIT = 120;
    const GROUP_MS = 900;

    let el: HTMLInputElement | null = null;
    let initialized = false;
    let suppressSync = false;
    let lastGroupAt = 0;

    let undoStack: Snapshot[] = [];
    let redoStack: Snapshot[] = [];

    function getSnapshot(): Snapshot {
        if (!el) {
            const offset = value.length;
            return { value, start: offset, end: offset };
        }

        return {
            value: el.value,
            start: el.selectionStart ?? el.value.length,
            end: el.selectionEnd ?? el.value.length,
        };
    }

    function sameSnapshot(a: Snapshot | undefined, b: Snapshot) {
        return !!a && a.value === b.value && a.start === b.start && a.end === b.end;
    }

    function pushUndo(snapshot: Snapshot) {
        if (sameSnapshot(undoStack.at(-1), snapshot)) return;

        undoStack.push(snapshot);
        if (undoStack.length > HISTORY_LIMIT) {
            undoStack.shift();
        }
    }

    function handleBeforeInput(e: InputEvent) {
        const isGroupable =
            e.inputType === "insertText" ||
            e.inputType === "deleteContentBackward" ||
            e.inputType === "deleteContentForward";

        const now = Date.now();
        if (isGroupable && now - lastGroupAt < GROUP_MS) return;

        pushUndo(getSnapshot());
        lastGroupAt = now;
    }

    function handleInput() {
        if (!el) return;
        value = el.value;
        redoStack = [];
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

    function applySnapshot(snapshot: Snapshot) {
        if (!el) return;

        suppressSync = true;
        value = snapshot.value;
        el.value = snapshot.value;

        const max = el.value.length;
        el.setSelectionRange(Math.min(snapshot.start, max), Math.min(snapshot.end, max));

        suppressSync = false;
    }

    export function undo() {
        if (!el || undoStack.length === 0) return;

        const current = getSnapshot();
        const previous = undoStack.pop();
        if (!previous) return;

        if (!sameSnapshot(redoStack.at(-1), current)) {
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

<div class="title-wrap mb-3">
    <input
        bind:this={el}
        class="title-input"
        value={value}
        placeholder={placeholder}
        spellcheck="false"
        onbeforeinput={handleBeforeInput}
        oninput={handleInput}
        onkeydown={handleKeyDown}
    />
</div>

<style>
    .title-wrap {
        padding: 0 4rem;
    }

    .title-input {
        width: 100%;
        border: none;
        outline: none;
        padding: 0;
        margin: 0;
        font-size: 38px;
        line-height: 1.25;
        font-weight: 700;
        color: var(--header-color);
        background: transparent;
    }

    .title-input::placeholder {
        color: var(--link-disabled);
    }
</style>
