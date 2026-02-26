export function isInput(element: any) {
    let tagName =
        element && element.tagName ? element.tagName.toLowerCase() : "";

    return (
        tagName === "input" ||
        tagName === "select" ||
        tagName === "textarea" ||
        element.isContentEditable
    );
}


export function toLocalDateString(date?: Date, short = true) {
    if (!date) return '';

    const d = new Date(date);
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const monthDay = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // 同一年：只显示 月-日 时:分
    if (d.getFullYear() === now.getFullYear() && short) {
        return `${monthDay} ${time}`;
    }

    // 不同年：显示完整日期
    return `${d.getFullYear()}-${monthDay} ${time}`;
}


export function saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    return selection.getRangeAt(0).cloneRange();
}

export function restoreSelection(savedRange: Range | null) {
    const selection = window.getSelection();
    if (selection && savedRange) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
}

// 对文章内容进行分段，返回段落编号及文字内容列表
export function stringSegment(content: string | undefined) {
    if (!content) return [];

    return content
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((text, index) => ({
            seg: index,
            text: text.trim(),
        }));
}


import { goto, invalidateAll } from '$app/navigation';
import { toast } from '$lib/stores/toast.svelte';
import { customAlphabet } from 'nanoid';
// const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
// Speed:1000 IDs per hour
// ~919 years or 8B IDs needed, in order to have a 1% probability of at least one collision.
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
// ~35 years or 308M IDs
export const nanoid = customAlphabet(alphabet, 12);
// nanoid() //=> "5KCLQ6RK4ues"


export function errorMessage(e: any) {
    let msg = "未知错误";

    if (e instanceof Error) {
        const anyErr = e as any;

        if (typeof anyErr.original === "string") {
            try {
                msg = JSON.parse(anyErr.original)?.error ?? e.message;
            } catch {
                msg = anyErr.original;
            }
        } else {
            msg = e.message;
        }
    }
    return msg;
}


export async function logout() {
    try {
        // session.user = null;
        const r = await fetch("/api/users/logout", {
            method: "POST",
            credentials: "include", // 重要：允许携带和接收cookies
        });

        if (r.ok) {
            toast.show("已退出登录！", "success");
        } else {
            var error = await r.json();

            toast.show(error.error, "error");
        }
        await goto("/");
        invalidateAll();
    } catch (error) {
        toast.show("与服务器通讯异常", "error");
    }
}