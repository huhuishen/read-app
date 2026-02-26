// schema/impl.ts
import { type CheckContext, type Infer, runPredicates, type Schema, SchemaError } from './core';


function primitiveCheck<T>(
    typeOf: "string" | "number" | "boolean"
) {
    return (v: unknown, ctx: any = {}, path = ""): T => {
        if (typeof v !== typeOf) {
            throw new SchemaError(path, typeOf, v);
        }

        runPredicates(ctx.predicates, v, path);
        return v as T;
    };
}



/* ───────── primitives ───────── */

export const string = (): Schema<string> => ({
    _def: { kind: "string" },
    check: primitiveCheck<string>("string"),
});

export const number = (): Schema<number> => ({
    _def: { kind: "number" },
    check: primitiveCheck<number>("number"),
});

export const boolean = (): Schema<boolean> => ({
    _def: { kind: "boolean" },
    check: primitiveCheck<boolean>("boolean"),
});


export const array = <S extends Schema<any>>(
    element: S
): Schema<Infer<S>[]> => ({
    _def: { kind: "array", element: element._def, },
    check(v, _ctx, path = '') {
        if (!Array.isArray(v)) {
            throw new SchemaError(path, 'array', v);
        }
        return v.map((item, i) =>
            element.check(item, _ctx, `${path}[${i}]`)
        );
    }
});

/* ───────── literal ───────── */

export const literal = <
    T extends string | number | boolean | null
>(
    value: T
): Schema<T> => ({
    _def: { kind: "literal", value },
    check(v, _ctx, path = '') {
        if (v !== value) {
            throw new SchemaError(path, JSON.stringify(value), v);
        }
        return value;
    }
});

/* ───────── union ───────── */

export const union = <S extends readonly Schema<any>[]>(
    ...items: S
): Schema<Infer<S[number]>> => ({
    _def: {
        kind: "union",
        items: items.map(i => i._def),
    },
    check(v, _ctx, path = '') {
        const errors: SchemaError[] = [];

        for (const s of items) {
            try {
                return s.check(v, _ctx, path);
            } catch (e) {
                if (e instanceof SchemaError) {
                    errors.push(e);
                }
            }
        }

        // 尝试合并 expected 信息
        const expected = mergeExpected(errors);

        throw new SchemaError(
            path,
            expected,
            v
        );
    }
});


function mergeExpected(errors: SchemaError[]): string {
    // 收集所有 expected
    const set = new Set<string>();

    for (const e of errors) {
        set.add(e.expected);
    }

    return Array.from(set).join(' | ');
}


/* ───────── object ───────── */

type Shape = Record<string, Schema<any, any>>;
type KeysOf<S extends Shape> = Extract<keyof S, string>;

export function object<S extends Shape>(
    shape: S
): Schema<
    { [K in keyof S]: Infer<S[K]> },
    KeysOf<S>
> {
    return {
        _def: {
            kind: "object",
            shape: Object.fromEntries(
                Object.entries(shape).map(([k, v]) => [k, v._def])
            ),
        },
        check(value, ctx: CheckContext<KeysOf<S>> = {}, path = '') {
            if (typeof value !== 'object' || value === null) {
                throw new SchemaError(path, 'object', value);
            }

            const obj = value as Record<string, unknown>;

            // TODO: 当存在array(object)结构时，错误地检查列表内对象的属性名称
            // 
            /* -------- required 校验 -------- */
            if (ctx.required) {
                for (const key of ctx.required) {
                    if (!(key in obj)) {
                        throw new SchemaError(
                            path ? `${path}.${key}` : key,
                            'present',
                            undefined
                        );
                    }
                }
            }

            /* -------- disallowed 校验 -------- */
            if (ctx.disallowed) {
                for (const key of ctx.disallowed) {
                    if ((key in obj)) {
                        throw new SchemaError(
                            path ? `${path}.${key}` : key,
                            'disallowed',
                            obj[key]
                        );
                    }
                }
            }

            /* -------- allowed 校验 -------- */
            if (ctx.allowed) {
                for (const key in obj) {
                    // 断言 key 为 K 类型，因为 key 来自于 obj 的 keys，而 obj 应该与 schema S 相关
                    if (!ctx.allowed.includes(key as KeysOf<S>)) {
                        throw new SchemaError(
                            path ? `${path}.${key}` : key,
                            'disallowed',
                            obj[key]
                        );
                    }
                }
            }


            const result: any = {};

            /* -------- 字段校验 -------- */
            for (const key in shape) {
                if (key in obj) {
                    const childPath = path ? `${path}.${key}` : key;

                    const valueChecked = shape[key].check(
                        obj[key],
                        ctx,
                        childPath
                    );

                    // 字段级 predicates
                    runPredicates(
                        ctx.predicates,
                        valueChecked,
                        childPath
                    );

                    result[key] = valueChecked;
                }
            }

            /* -------- 对象级 predicates -------- */
            runPredicates(ctx.predicates, result, path);

            return result;
        }
    };
}

/**
 * literalUnion(['a','b','c']) -> union(literal('a'), literal('b'), literal('c'))
 */
// export const literalUnion = <T extends readonly (string | number | boolean | null)[]>(
//     arr: T
// ): Schema<T[number]> => {
//     const schemas: Schema<any>[] = arr.map(v => literal(v));
//     return union(...schemas);
// };

/**
 * constraint(schema, predicate, message)
 * - schema: 已有 schema
 * - predicate: 额外验证函数，返回 boolean
 * - message: 错误提示，可选
 */
// export const constraint = <S extends Schema<any>>(
//     schema: S,
//     predicate: (v: Infer<S>) => boolean,
//     message?: string
// ): Schema<Infer<S>> => ({
//     check(v, _ctx, path = '') {
//         const value = schema.check(v, _ctx, path);
//         if (!predicate(value)) {
//             throw new SchemaError(
//                 path,
//                 message || 'constraint check failed',
//                 value
//             );
//         }
//         return value;
//     }
// });

/**
 * 链式 refine wrapper
 */
// export const constraints = <S extends Schema<any>>(schema: S) => {
//     const refinements: Array<[(v: Infer<S>) => boolean, string?]> = [];

//     const wrapper: Schema<Infer<S>> & {
//         constraint: (predicate: (v: Infer<S>) => boolean, message?: string) => typeof wrapper
//     } = {
//         check(v, _ctx, path = '') {
//             let value = schema.check(v, _ctx, path);
//             for (const [pred, msg] of refinements) {
//                 if (!pred(value)) {
//                     throw new SchemaError(
//                         path,
//                         msg || 'refine check failed',
//                         value
//                     );
//                 }
//             }
//             return value;
//         },

//         constraint(predicate, message) {
//             refinements.push([predicate, message]);
//             return wrapper;
//         }
//     };

//     return wrapper;
// };

// export function optional<
//     T,
//     K extends string
// >(schema: Schema<T, K>): Schema<T | undefined, K> {
//     return {
//         _def: {
//             kind: "optional",
//             inner: schema._def
//         },

//         check(value, ctx: CheckContext<K> = {}, path = '') {
//             if (value === undefined) {
//                 return undefined;
//             }

//             return schema.check(value, ctx, path);
//         }
//     };
// }
// function enhanceSchema<
//     T,
//     K extends string
// >(schema: Schema<T, K>): Schema<T, K> {
//     return Object.assign(schema, {
//         optional() {
//             return optional(schema);
//         }
//     });
// }