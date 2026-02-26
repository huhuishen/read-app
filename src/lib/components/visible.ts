import type { Action } from "svelte/action";

export type VisibleOptions = {

    /** 可滚动容器，不提供则使用 window */
    root?: HTMLElement | null;

    /** 可见比例，0 = 任意可见，1 = 完全可见 */
    threshold?: number;

    /** 可见状态变化回调 */
    onChange?: (visible: boolean, entry: IntersectionObserverEntry) => void;
};

export const visible: Action<HTMLElement, VisibleOptions> = (node, options = {}) => {
    let observer: IntersectionObserver | null = null;

    function cleanup() {
        observer?.disconnect();
        observer = null;
    }

    function init() {
        cleanup();

        if (typeof window === "undefined") return;

        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                options.onChange?.(
                    entry.isIntersecting,
                    entry
                );
            },
            {
                root: options.root ?? null,
                threshold: options.threshold ?? 0,
            }
        );

        observer.observe(node);
    }

    init();

    return {

        update(newOptions) {
            options = newOptions;
            init();
        },

        destroy() {
            cleanup();
        }
    };
};