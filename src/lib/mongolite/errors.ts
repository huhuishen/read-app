/**
 * errors.ts
 * Unified error types for MongoLite
 */
export class MongoLiteError extends Error {
    code?: string;
    details?: any;
    constructor(code: string, message: string, details?: any) {
        super(message);
        this.name = "MongoLiteError";
        this.code = code;
        this.details = details;
    }
}

// export class ValidationError extends MongoLiteError {
//     constructor(message: string, details?: any) {
//         super("validation_error", message, details);
//         this.name = "ValidationError";
//     }
// }

// export class NotFoundError extends MongoLiteError {
//     constructor(message = "Not found", details?: any) {
//         super("not_found", message, details);
//         this.name = "NotFoundError";
//     }
// }
