/**
 * errors.ts
 * mongodb 原生异常解析工具集。
 *
 * 设计原则：
 *   - 不再包装 mongodb 原生异常，让 driver 异常直接透传；
 *   - 所有方法接受 unknown 输入，业务层可用 instanceof 判断 + code 字段分流；
 *   - 静态方法集，无状态。
 *
 * 使用示例：
 *   try {
 *       await users.insertOne({ email });
 *   } catch (e) {
 *       if (MongoErrorHelper.isDuplicateKey(e)) {
 *           // 友好提示："该邮箱已注册"
 *       } else if (MongoErrorHelper.isNetworkError(e)) {
 *           // 网络问题，可重试
 *       } else {
 *           throw e;
 *       }
 *   }
 */
import {
    MongoError,
    MongoServerError,
    MongoNetworkError,
    MongoNetworkTimeoutError,
    MongoServerSelectionError,
    MongoParseError,
    MongoNotConnectedError,
    MongoBulkWriteError,
    MongoWriteConcernError,
} from "mongodb";

export class MongoErrorHelper {
    // ============== 类型判断 ==============

    /** 是否 mongodb 驱动抛出的异常（基类） */
    static isMongoError(e: unknown): boolean {
        return e instanceof MongoError;
    }

    /** 是否服务端返回的错误（带 code/codeName/errInfo） */
    static isServerError(e: unknown): boolean {
        return e instanceof MongoServerError;
    }

    /** 是否网络层错误（TCP 中断 / socket 失败） */
    static isNetworkError(e: unknown): boolean {
        return e instanceof MongoNetworkError;
    }

    /** 是否网络超时 */
    static isNetworkTimeout(e: unknown): boolean {
        return e instanceof MongoNetworkTimeoutError;
    }

    /** 是否服务端选择失败（拓扑/连接问题，driver 拒绝执行命令） */
    static isServerSelectionError(e: unknown): boolean {
        return e instanceof MongoServerSelectionError;
    }

    /** 是否 URI 语法错误 */
    static isParseError(e: unknown): boolean {
        return e instanceof MongoParseError;
    }

    /** 是否客户端尚未连接（由 client.ts 在未连接时主动抛出） */
    static isNotConnected(e: unknown): boolean {
        return e instanceof MongoNotConnectedError;
    }

    /** 是否批量写部分失败（含 writeErrors 数组） */
    static isBulkWriteError(e: unknown): boolean {
        return e instanceof MongoBulkWriteError;
    }

    /** 是否写关注失败 */
    static isWriteConcernError(e: unknown): boolean {
        return e instanceof MongoWriteConcernError;
    }

    // ============== 业务语义判断（基于 code） ==============

    /** 是否唯一索引冲突（code 11000 / 110） */
    static isDuplicateKey(e: unknown): boolean {
        if (!(e instanceof MongoServerError)) return false;
        const code = e.code;
        return code === 11000 || code === 110;
    }

    /** 是否 schema 校验失败（code 121，errInfo.details 有详情） */
    static isValidationError(e: unknown): boolean {
        if (!(e instanceof MongoServerError)) return false;
        return e.code === 121;
    }

    /** 是否事务写冲突（code 112，乐观锁/事务并发场景） */
    static isWriteConflict(e: unknown): boolean {
        if (!(e instanceof MongoServerError)) return false;
        return e.code === 112;
    }

    /** 是否超时（driver 网络超时，或 server code 50 / 262） */
    static isTimeout(e: unknown): boolean {
        if (e instanceof MongoNetworkTimeoutError) return true;
        if (e instanceof MongoServerError) {
            return e.code === 50 || e.code === 262;
        }
        return false;
    }

    /** 是否鉴权失败（code 13 Unauthorized / 18 AuthenticationFailed） */
    static isUnauthorized(e: unknown): boolean {
        if (!(e instanceof MongoServerError)) return false;
        return e.code === 13 || e.code === 18;
    }

    /** 是否可重试错误（基于 driver 的 errorLabel） */
    static isRetryable(e: unknown): boolean {
        if (e instanceof MongoError) {
            return e.hasErrorLabel("RetryableWriteError")
                || e.hasErrorLabel("TransientTransactionError");
        }
        return false;
    }

    // ============== 字段提取 ==============

    /** 获取 mongodb 错误码（number），非 mongodb 异常返回 undefined */
    static getErrorCode(e: unknown): number | undefined {
        if (e instanceof MongoError) {
            const code = e.code;
            return typeof code === "number" ? code : undefined;
        }
        return undefined;
    }

    /** 获取错误码名称（如 "DuplicateKey"），无则 undefined */
    static getErrorCodeName(e: unknown): string | undefined {
        if (e instanceof MongoServerError) return e.codeName;
        return undefined;
    }

    /** 获取服务端原始错误文档（含 errInfo 详情），无则 undefined */
    static getErrorInfo(e: unknown) {
        if (e instanceof MongoServerError) return e.errInfo;
        return undefined;
    }

    // ============== 友好描述 & 上报 ==============

    /**
     * 获取友好的错误描述（适合用于用户提示或日志摘要）。
     * 仅针对常见类型返回中文描述，其余返回原始 message。
     */
    static getFriendlyMessage(e: unknown): string {
        if (MongoErrorHelper.isDuplicateKey(e)) return "数据已存在（唯一约束冲突）";
        if (MongoErrorHelper.isValidationError(e)) return "数据校验失败";
        if (MongoErrorHelper.isWriteConflict(e)) return "数据已被修改，请重试";
        if (MongoErrorHelper.isTimeout(e)) return "操作超时";
        if (MongoErrorHelper.isUnauthorized(e)) return "鉴权失败";
        if (MongoErrorHelper.isNetworkError(e)) return "网络异常，请稍后重试";
        if (MongoErrorHelper.isServerSelectionError(e)) return "数据库不可用";
        if (MongoErrorHelper.isNotConnected(e)) return "数据库未连接";
        if (MongoErrorHelper.isParseError(e)) return "连接字符串格式错误";
        if (e instanceof Error) return e.message;
        return String(e);
    }

    /**
     * 转换为可序列化的对象，用于日志/上报。
     * 包含：name、message、code、codeName、errInfo、retryable、stack。
     */
    static toSerializable(e: unknown) {
        if (e instanceof MongoError) {
            return {
                name: e.name,
                message: e.message,
                code: MongoErrorHelper.getErrorCode(e),
                codeName: MongoErrorHelper.getErrorCodeName(e),
                errInfo: MongoErrorHelper.getErrorInfo(e),
                retryable: MongoErrorHelper.isRetryable(e),
                stack: e.stack,
            };
        }
        if (e instanceof Error) {
            return {
                name: e.name,
                message: e.message,
                stack: e.stack,
            };
        }
        return { name: "UnknownError", message: String(e) };
    }
}
