/**
 * 全局 loading 状态 —— Svelte 5 rune 实现
 *
 * 使用引用计数支持多个并发请求：
 * - start() 时 count++，显示加载指示器
 * - stop() 时 count--，归零时隐藏
 */
function createLoadingState() {
    let active = $state(false);
    let count = 0;

    return {
        get active() {
            return active;
        },
        start() {
            count++;
            active = true;
        },
        stop() {
            count = Math.max(0, count - 1);
            if (count === 0) {
                active = false;
            }
        }
    };
}

export const loading = createLoadingState();
