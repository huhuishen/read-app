export type Snapshot = {
    value: string;
    start: number;
    end: number;
};

export const HISTORY_LIMIT = 300;
export const GROUP_MS = 900;

export function sameSnapshot(a: Snapshot | undefined, b: Snapshot) {
    return !!a && a.value === b.value && a.start === b.start && a.end === b.end;
}

export function pushSnapshot(stack: Snapshot[], snapshot: Snapshot, limit = HISTORY_LIMIT) {
    const last = stack.at(-1);
    if (sameSnapshot(last, snapshot)) return;

    stack.push(snapshot);
    if (stack.length > limit) {
        stack.shift();
    }
}

export function isGroupableInputType(inputType: string) {
    return (
        inputType === "insertText" ||
        inputType === "deleteContentBackward" ||
        inputType === "deleteContentForward" ||
        inputType === "insertCompositionText"
    );
}
