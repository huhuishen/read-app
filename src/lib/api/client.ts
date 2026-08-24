import { ApiError } from "./error";
import { showError } from "$lib/stores/toast.svelte";
import { loading } from '$lib/stores/loading.svelte';

/** 判断是否在浏览器环境 */
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

/** 查询参数值，null/undefined 会被自动忽略 */
export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    /** 请求体：对象自动序列化为 JSON 并设置 Content-Type；string/FormData 等原样透传 */
    body?: unknown;
    /** URL 查询参数 */
    query?: QueryParams;
    /** 请求超时时间（毫秒），超时抛出 status 为 0 的 ApiError */
    timeoutMs?: number;
}

export interface ApiClientConfig {
    /** 统一 URL 前缀（如 "/api"）；以 http(s):// 或 // 开头的 URL 不会拼接前缀 */
    baseUrl?: string;
    /** 所有请求的默认超时时间（毫秒） */
    timeoutMs?: number;
    /** 附加到所有请求的公共请求头，单次请求的同名头会覆盖它 */
    headers?: HeadersInit;
}

/** 绑定具体 fetcher 与配置的 RESTful 客户端 */
export interface ApiClient {
    request<T>(url: string, options?: ApiRequestOptions): Promise<T>;
    get<T>(url: string, options?: Omit<ApiRequestOptions, "body">): Promise<T>;
    post<T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, "body">): Promise<T>;
    put<T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, "body">): Promise<T>;
    patch<T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, "body">): Promise<T>;
    del<T>(url: string, options?: Omit<ApiRequestOptions, "body">): Promise<T>;
    /** 从 catch 块捕获的未知错误中提取可读消息，便于直接展示给用户 */
    error(err: unknown): string;
}

function buildUrl(url: string, query?: QueryParams): string {
    if (!query) return url;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                if (item != null) params.append(key, String(item));
            }
        } else if (value != null) {
            params.set(key, String(value));
        }
    }

    const qs = params.toString();
    if (!qs) return url;
    return url + (url.includes("?") ? "&" : "?") + qs;
}

function joinUrl(baseUrl: string | undefined, url: string): string {
    if (!baseUrl) return url;
    // 绝对地址不拼接前缀
    if (/^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith("//")) return url;
    return baseUrl.replace(/\/+$/, "") + (url.startsWith("/") ? url : `/${url}`);
}

function isRawBody(body: unknown): body is BodyInit {
    return (
        typeof body === "string" ||
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        body instanceof URLSearchParams ||
        body instanceof ReadableStream
    );
}

function mergeHeaders(base?: HeadersInit, extra?: HeadersInit): Headers {
    const merged = new Headers(base);
    new Headers(extra).forEach((value, key) => merged.set(key, value));
    return merged;
}

/** 204/空响应返回 undefined，其余优先按 JSON 解析，失败则回退为原始文本 */
async function parseResponseBody(res: Response): Promise<unknown> {
    if (res.status === 204 || res.status === 205) return undefined;

    const text = await res.text();
    if (!text) return undefined;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/** 从错误负载中提取可读消息，兼容 SvelteKit 的 { error } / { message } 结构 */
function extractErrorMessage(body: unknown, res: Response): string {
    if (typeof body === "string" && body.trim()) return body;
    if (body && typeof body === "object") {
        const record = body as Record<string, unknown>;
        for (const key of ["error", "message", "detail"]) {
            const value = record[key];
            if (typeof value === "string" && value.trim()) return value;
        }
    }
    return res.statusText || `请求失败（状态码 ${res.status}）`;
}

/**
 * 统一的请求核心：所有客户端请求都应经由本函数。
 *
 * 能力：
 * - 自动携带 Cookie（credentials: "include"）
 * - 对象请求体自动 JSON 序列化并设置 Content-Type
 * - 查询参数自动编码
 * - 超时与调用方 AbortSignal 可同时生效
 * - 204/空响应安全处理
 * - 非 2xx 统一抛出 ApiError（自动解析服务端 JSON 错误消息）
 * - 网络层异常（断网/超时）统一转换为 status 为 0 的 ApiError
 */
export async function apiFetch<T>(
    fetcher: typeof fetch,
    url: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { body, query, timeoutMs, headers, signal, ...init } = options;

    const finalHeaders = new Headers(headers);
    let payload: BodyInit | undefined;
    if (body !== undefined) {
        if (isRawBody(body)) {
            payload = body;
        } else {
            payload = JSON.stringify(body);
            if (!finalHeaders.has("Content-Type")) {
                finalHeaders.set("Content-Type", "application/json");
            }
        }
    }

    const timeoutSignal = timeoutMs ? AbortSignal.timeout(timeoutMs) : null;
    const finalSignal =
        signal && timeoutSignal
            ? AbortSignal.any([signal, timeoutSignal])
            : signal ?? timeoutSignal ?? undefined;

    let res: Response;
    try {
        loading.start();
        res = await fetcher(buildUrl(url, query), {
            credentials: "include",
            ...init,
            headers: finalHeaders,
            body: payload,
            signal: finalSignal,
        });
    } catch (err) {
        // 调用方主动取消：原样传播，不包装
        if (signal?.aborted) throw err;
        if (timeoutSignal?.aborted) {
            const errorMsg = `请求超时（${timeoutMs}ms）`;
            if (isBrowser) showError(errorMsg);
            throw new ApiError(0, errorMsg);
        }
        const message = err instanceof Error ? err.message : String(err);
        const errorMsg = `网络请求失败：${message}`;
        if (isBrowser) showError(errorMsg);
        throw new ApiError(0, errorMsg);
    } finally {
        loading.stop();
    }

    const data = await parseResponseBody(res);

    if (!res.ok) {
        const errorMsg = extractErrorMessage(data, res);
        if (isBrowser) showError(`请求失败 (状态码 ${res.status}), ${errorMsg}`);
        throw new ApiError(res.status, errorMsg, data);
    }

    return data as T;
}

/**
 * 创建绑定具体 fetcher 的 RESTful 客户端。
 *
 * - 浏览器端交互（按钮事件等）使用全局 fetch：`createApiClient(fetch, { baseUrl: "/api" })`
 * - SvelteKit load/表单处理中必须使用 `event.fetch` 以正确转发 Cookie 与 SSR 内联
 */
export function createApiClient(fetcher: typeof fetch, config: ApiClientConfig = {}): ApiClient {
    const request = <T>(url: string, options: ApiRequestOptions = {}): Promise<T> =>
        apiFetch<T>(fetcher, joinUrl(config.baseUrl, url), {
            timeoutMs: config.timeoutMs,
            ...options,
            headers: mergeHeaders(config.headers, options.headers),
        });

    return {
        request,
        get: (url, options = {}) => request(url, { ...options, method: "GET" }),
        post: (url, body, options = {}) => request(url, { ...options, method: "POST", body }),
        put: (url, body, options = {}) => request(url, { ...options, method: "PUT", body }),
        patch: (url, body, options = {}) => request(url, { ...options, method: "PATCH", body }),
        del: (url, options = {}) => request(url, { ...options, method: "DELETE" }),
        error: (err: unknown): string => {
            if (err instanceof ApiError) return `[${err.status}] ${err.message}`;
            if (err instanceof Error) return err.message;
            return err == null ? "未知错误" : String(err);
        },
    };
}

/**
 * 浏览器端默认客户端（组件交互场景直接使用）。
 * 注意：+page.server.ts / +layout.server.ts 等服务端代码请改用
 * `createApiClient(event.fetch, ...)`。
 */
export const api: ApiClient = createApiClient((input, init) => fetch(input, init), {
    baseUrl: "/api",
});
