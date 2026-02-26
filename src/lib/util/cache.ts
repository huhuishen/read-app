export class SimpleCache {
    private cache: Map<string, any>;

    constructor() {
        this.cache = new Map();
    }

    // 获取缓存，若没有缓存则通过 fetchFn 获取数据并缓存
    async get(key: string, fetchFn: () => Promise<any>): Promise<any> {
        // console.log(this.cache);

        // 如果缓存中有数据，直接返回
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        // 如果缓存中没有数据，则从数据库获取数据并缓存
        const data = await fetchFn();
        if (!data) {
            return null;
        }

        this.cache.set(key, data);
        return data;
    }

    // 清空缓存
    clear() {
        this.cache.clear();
    }

    // 删除指定缓存项
    delete(key: string) {
        this.cache.delete(key);
    }
}