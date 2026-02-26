// schema/core.ts
export interface CheckContext<K extends string = string> {
    /** 运行时指定必选字段（仅 object schema 使用） */
    required?: readonly K[];

    /** 运行时不允许指定的字段（仅 object schema 使用） */
    disallowed?: readonly K[];

    /** 运行时允许指定的字段（仅 object schema 使用） */
    allowed?: readonly K[];

    /** refine / predicate 规则 */
    predicates?: readonly Predicate[];
}

export interface Predicate<T = any> {
    /** 仅当 path 匹配时才生效（用于对象字段 refine） */
    path?: string;
    check(value: T): boolean;
    message?: string;
}


export function runPredicates<T>(
    predicates: readonly Predicate[] | undefined,
    value: T,
    path: string
) {
    if (!predicates) return;

    for (const p of predicates) {
        // path 不匹配则跳过
        if (p.path && p.path !== path) continue;

        if (!p.check(value)) {
            throw new SchemaError(
                path,
                p.message ?? 'refine check failed',
                value
            );
        }
    }
}

export type SchemaDef =
    | { kind: "string" }
    | { kind: "number" }
    | { kind: "boolean" }
    | { kind: "ObjectId" }
    | { kind: "Date" }
    | { kind: "literal"; value: string | number | boolean | null }
    | { kind: "array"; element: SchemaDef }
    | { kind: "union"; items: SchemaDef[] }
    | { kind: "object"; shape: Record<string, SchemaDef> }
    | { kind: "optional"; inner: SchemaDef };


export interface Schema<T, K extends string = never> {
    readonly _def: SchemaDef;

    check(
        value: unknown,
        ctx?: CheckContext<K>,
        path?: string
    ): T;

    // optional(): Schema<T | undefined, K>;
}


export type Infer<S> =
    S extends Schema<infer T> ? T : never;

export class SchemaError extends Error {
    constructor(
        public readonly path: string,
        public readonly expected: Expected,
        public readonly actual: unknown
    ) {
        super(buildMessage(path, expected, actual));
    }
}

type Expected =
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array'
    | 'present'
    | string; // literal / union

function buildMessage(path: string, expected: Expected, actual: unknown) {
    // 处理必填字段错误
    if (expected === 'present') {
        return `Missing required field at ${path || '<root>'}`;
    }

    // 处理类型错误
    if (
        expected === 'string' ||
        expected === 'number' ||
        expected === 'boolean' ||
        expected === 'object' ||
        expected === 'array'
    ) {
        return `Invalid value at ${path || '<root>'}, expected ${expected}, got ${typeof actual}`;
    }

    const val = typeof actual === 'string' ? `'${actual}'` : actual
    return `predicate error at ${path || '<root>'}, ${expected}, got ${val}`;
}