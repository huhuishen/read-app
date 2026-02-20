import type { ToastState } from "$lib/stores/toast.svelte";
import { error } from "@sveltejs/kit";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiError {
    message: string;
    status: number;
}

export interface RequestOptions<TBody = unknown> {
    fetch?: typeof fetch; // 支持 event.fetch
    method?: HttpMethod;
    body?: TBody;
    query?: Record<string, string | number | boolean | undefined>;
    headers?: HeadersInit;
    token?: string;
}

/**
 * 通用 API 请求函数
 */
// lib/api/request.ts
export async function apiRequest<TResponse, TBody = unknown>(
    url: string,
    options: RequestOptions<TBody> = {},
): Promise<TResponse> {
    const {
        method = "GET",
        body,
        query,
        headers,
        fetch: customFetch,
    } = options;

    const fetchFn = customFetch ?? globalThis.fetch;

    // 拼接 query
    if (query) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined) {
                params.append(key, String(value));
            }
        }
        const qs = params.toString();
        if (qs) {
            url += `?${qs}`;
        }
    }

    const res = await fetchFn(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    let data: any = null;

    try {
        data = await res.json();
    } catch {
        throw {
            message: "服务器响应非 JSON 内容",
            status: res.status,
        } satisfies ApiError;
    }

    if (!res.ok) {
        // throw {
        //     message: data?.message ?? "Request failed",
        //     status: res.status,
        // } satisfies ApiError;
        throw error(res.status, data?.message ?? "请求失败且响应JSON对象不包含message属性");
    }

    return data as TResponse;
}

export async function safeRequest<TResponse, TBody = unknown>(
    url: string,
    options: RequestOptions<TBody>,
    toast?: { show: (msg: string, type: string) => void },
): Promise<TResponse | null> {
    try {
        return await apiRequest<TResponse, TBody>(url, options);
    } catch (err) {
        const e = err as ApiError;
        toast?.show(e.message, "error");
        return null;
    }
}


export function createApi(fetchFn?: typeof fetch) {
    return {
        get: <T>(url: string, query?: Record<string, any>) =>
            apiRequest<T>(url, {
                method: "GET",
                query,
                fetch: fetchFn,
            }),

        post: <T, B>(url: string, body?: B) =>
            apiRequest<T, B>(url, {
                method: "POST",
                body,
                fetch: fetchFn,
            }),

        put: <T, B>(url: string, body?: B) =>
            apiRequest<T, B>(url, {
                method: "PUT",
                body,
                fetch: fetchFn,
            }),

        patch: <T, B>(url: string, body?: B) =>
            apiRequest<T, B>(url, {
                method: "PATCH",
                body,
                fetch: fetchFn,
            }),

        delete: <T>(url: string) =>
            apiRequest<T>(url, {
                method: "DELETE",
                fetch: fetchFn,
            }),
    };
}

export async function safeCall<T>(
    promise: Promise<T>,
    toast?: ToastState,
): Promise<T | null> {
    try {
        return await promise;
    } catch (err: any) {
        toast?.show(err.body.message ?? "请求失败", "error");
        return null;
    }
}