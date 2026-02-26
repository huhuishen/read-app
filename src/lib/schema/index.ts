// schema/index.ts
export * from './core';

import * as impl from './impl';
import * as custom from './custom';

/**
 * 
    功能	描述	类型 / 运行时特性
    Schema < T > 所有 schema 的基础类型	check(v, path ?) => T，失败 throw SchemaError
    Infer < S > 类型推导	从 schema 自动推导 TypeScript 类型
    required() / optional()	字段是否必填	运行时校验 + 类型层 optional / required
    object()	对象 schema	默认 optional 字段，显式 required，可嵌套对象
    array()	数组 schema	运行时元素逐个 check，类型自动推导
    literal()	字面量类型	精确匹配字符串、数字、boolean 或 null
    union()	联合类型	支持多个 schema，顺序匹配，第一个通过返回值
    objectId()	MongoDB ObjectId	运行时 instanceof 检查
    refine()	单次自定义验证	对单个 schema 添加业务规则，失败 throw
    chainRefine()	链式自定义验证	多条件独立报错，链式调用，仍返回原类型
    SchemaError	错误对象	包含 path、expected、actual，支持嵌套路径

    核心设计特点

    单入口 check：
    所有 schema 都只有 check(v, path?)
    失败直接 throw 错误，错误包含路径信息

    类型安全：
    Infer<S> 自动推导 TypeScript 类型
    optional/required、literal、union 都被类型正确映射

    组合性强：
    对象、数组、union、refine 都可自由组合
    支持嵌套对象与复杂业务规则

    最小实现：
    无 class / proxy / AST
    不做 coercion / transform
    仅依赖 ObjectId 类型库

    错误信息清晰：
    支持精确路径定位
    refine 链式可独立报错
 */

const t = { ...custom, ...impl }

export { t }
