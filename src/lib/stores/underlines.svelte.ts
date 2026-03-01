import { nanoid } from 'nanoid';

export type UnderlineRange = {
    id: string;
    seg: number;
    start: number;
    end: number;
    text: string;
    color?: string;
};

let underlines = $state<UnderlineRange[]>([]);

export const underlineManager = {
    get underlines() { return underlines; },

    set(underlinesNew: UnderlineRange[]) {
        if (!Array.isArray(underlinesNew)) {
            return;
        }
        underlines = [...underlinesNew];
    },

    // 添加划线
    add(segmentId: number, startIndex: number, endIndex: number, text: string, color: string | undefined = undefined) {
        underlines = [
            ...underlines,
            {
                id: nanoid(),
                seg: segmentId,
                start: startIndex,
                end: endIndex,
                text,
            }
        ]
    },

    // 获取指定段落的划线
    filter(segmentId: number): UnderlineRange[] {
        const result = underlines.filter(u => u.seg === segmentId);
        return result;
    },

    clear() {
        underlines = [];
    },
};
