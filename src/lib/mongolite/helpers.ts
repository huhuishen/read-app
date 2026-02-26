/**
 * helpers.ts
 * small helper utilities
 */
import { ObjectId } from "mongodb";

export const isObject = (v: any) => v !== null && typeof v === "object" && !Array.isArray(v);

export const isObjectIdLike = (v: any) =>
    v instanceof ObjectId || (typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v));

export function ensureObjectId(v: any) {
    if (v instanceof ObjectId) return v;
    if (typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v)) return new ObjectId(v);
    throw new Error("Invalid ObjectId");
}

export function stripUndefined<T extends Record<string, any>>(obj: T): T {
    const out: any = {};
    for (const k in obj) {
        if (obj[k] !== undefined) out[k] = obj[k];
    }
    return out;
}

/**
 * 深度替换所有 ObjectId 为 string 形式
 * 支持 Object / Array / 混合结构
 * 不进行额外的 JSON 拷贝，因此性能更高
 */
export function convertObjectIds<T>(value: T): T {
    const stack = [value as any];

    while (stack.length) {
        const cur = stack.pop();
        if (cur == null) continue;

        if (Array.isArray(cur)) {
            for (let i = 0; i < cur.length; i++) {
                const v = cur[i];
                if (v instanceof ObjectId) {
                    cur[i] = v.toHexString();
                } else if (v && typeof v === "object") {
                    stack.push(v);
                }
            }
        } else if (typeof cur === "object") {
            for (const k in cur) {
                const v = cur[k];
                if (v instanceof ObjectId) {
                    cur[k] = v.toHexString();
                } else if (v && typeof v === "object") {
                    stack.push(v);
                }
            }
        }
    }

    return value;
}