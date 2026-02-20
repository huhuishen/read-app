// sk-safe.ts
import { error as kitError, redirect } from '@sveltejs/kit';
import { isRedirect, isHttpError } from '@sveltejs/kit';

/* -------------------------
   日志钩子（可关闭）
-------------------------- */
let errorLogger: (err: SafeError) => void = () => { };
// let errorLogger = (err: SafeError) => { console.error(err) };

export function setErrorLogger(fn: (err: SafeError) => void) {
    errorLogger = fn;
}

/** 取消日志输出（完全关闭上报） */
export function disableErrorLogger() {
    errorLogger = () => { };
}

/* -------------------------
   Result 类型
-------------------------- */
export class Result<T> {
    private constructor(
        public ok: boolean,
        public value?: T,
        public err?: SafeError
    ) { }

    static ok<T>(v: T) {
        return new Result<T>(true, v);
    }

    static err(e: SafeError) {
        return new Result<never>(false, undefined, e);
    }

    /** 成功返回值，失败自动抛给 SvelteKit */
    unwrap(): T {
        if (this.ok) return this.value as T;

        /** 直接抛给 SvelteKit → 进入 +error.svelte */
        throw kitError(this.err!.status, {
            message: this.err!.message,
            stack: this.err!.stack,
            original: this.err!.original,
            cause: this.err!.cause,
        } as any);
    }
}

/* -------------------------
   SafeError：带状态码 + stack
-------------------------- */
export class SafeError extends Error {
    constructor(
        public status: number,
        message: string,
        public original?: unknown
    ) {
        super(message);
        if (original instanceof Error) {
            this.stack = original.stack;
        }
    }
}

/* -------------------------
   基础 safe (返回 Result)
-------------------------- */
export async function _safe<T>(fn: () => T | Promise<T>): Promise<Result<T>> {
    try {
        return Result.ok(await fn());
    } catch (e) {
        if (isRedirect(e) || isHttpError(e)) {
            throw e; // 必须继续抛出
        }

        const se =
            e instanceof SafeError
                ? e
                : new SafeError(
                    500,
                    e instanceof Error ? e.message : String(e),
                    e
                );

        errorLogger(se);
        return Result.err(se);
    }
}

/* -------------------------
   safe2：成功返回值，失败自动 throw
-------------------------- */
export async function safe<T>(fn: () => T | Promise<T>): Promise<T> {
    const r = await _safe(fn);
    return r.unwrap(); // unwrap 内部会自动 throw SafeError
}


/*
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else if (error && typeof error === 'object' && 'message' in error) {
        return String((error as any).message);
    } else {
        return 'An unknown error occurred';
    }
}

*/