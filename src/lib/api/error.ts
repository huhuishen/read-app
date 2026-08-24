/**
 * 统一的 API 错误类型。
 * `status > 0` 表示服务端返回的错误状态码；`status === 0` 表示网络层错误（断网、超时、取消等）。
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        /** 服务端返回的原始错误负载，可用于读取字段级错误详情 */
        public details?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }

    /** 是否为网络层错误（未收到响应或请求被取消/超时） */
    get isNetworkError(): boolean {
        return this.status === 0;
    }
}
