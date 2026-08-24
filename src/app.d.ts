// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
        interface Locals {
            // 保持与业务代码一致：所有 API / 组件入参都写着 Partial<models.User>。
            // session 存储的 user（$lib/auth/types.User）在结构上与该类型兼容，
            // 运行时直接赋值不会有问题。
            user: Partial<import('$lib/models').User> | null;
        }
    }
}

export { };
