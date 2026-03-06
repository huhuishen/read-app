export class ReadTimer {
    private interval: number;
    private idleThreshold: number;

    private readSeconds = 0; // 总累计秒数
    private active = false;

    private lastActiveTime = Date.now();
    private idleTimeoutId: number | null = null;
    private tickId: number | null = null;

    private onUpdate: (t: number) => void;
    private activityHandler = () => this.onUserActivity();
    private visibilityHandler = () => {
        if (document.visibilityState === "hidden") {
            this.markInactive();
            this.accumulateAndSend(true);
            return;
        }
        this.markActive();
    };
    private blurHandler = () => {
        this.markInactive();
    };
    private beforeUnloadHandler = () => {
        this.accumulateAndSend(true);
    };
    private pageHideHandler = () => {
        this.accumulateAndSend(true);
    };

    constructor(
        onUpdate: (t: number) => void,
        { interval = 30000, idleThreshold = 30000 } = {}
    ) {
        this.interval = interval;          // 毫秒
        this.idleThreshold = idleThreshold;
        this.onUpdate = onUpdate;

        this.bindEvents();
        this.startTick();                  // 改为 tick 驱动
    }

    // -----------------------------
    // 用户行为监听
    // -----------------------------
    private bindEvents() {
        const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

        events.forEach(e =>
            window.addEventListener(e, this.activityHandler, true)
        );

        document.addEventListener("visibilitychange", this.visibilityHandler);

        window.addEventListener("blur", this.blurHandler);

        // 如果页面即将卸载，强制发送剩余时间
        window.addEventListener("beforeunload", this.beforeUnloadHandler);
        // iOS Safari / bfcache 场景下，pagehide 比 beforeunload 更可靠
        window.addEventListener("pagehide", this.pageHideHandler);
    }

    private unbindEvents() {
        const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

        events.forEach(e =>
            window.removeEventListener(e, this.activityHandler, true)
        );

        document.removeEventListener("visibilitychange", this.visibilityHandler);
        window.removeEventListener("blur", this.blurHandler);
        window.removeEventListener("beforeunload", this.beforeUnloadHandler);
        window.removeEventListener("pagehide", this.pageHideHandler);
    }

    // -----------------------------
    // 用户活跃
    // -----------------------------
    private onUserActivity() {
        if (!this.active) {
            this.markActive();
        }
    }

    private markActive() {
        this.active = true;
        this.lastActiveTime = Date.now();

        if (this.idleTimeoutId) clearTimeout(this.idleTimeoutId);

        this.idleTimeoutId = window.setTimeout(() => {
            this.markInactive();
        }, this.idleThreshold);
    }

    private markInactive() {
        this.active = false;
    }

    // -----------------------------
    // 核心：tick 统一驱动
    // -----------------------------
    private startTick() {
        if (this.tickId) return;

        this.markActive();
        this.tickId = window.setInterval(() => {
            if (!this.active ||
                document.visibilityState !== "visible" ||
                !document.hasFocus()) {
                this.lastActiveTime = Date.now();
                return;
            }

            this.accumulateAndSend();
        }, 1000);
    }

    // -----------------------------
    // 强制发送剩余时间
    // -----------------------------
    public accumulateAndSend(force = false) {
        const now = Date.now();
        const delta = now - this.lastActiveTime;
        this.readSeconds += delta;
        this.lastActiveTime = now;

        // console.log(`${this.readSeconds}`);
        if (this.readSeconds <= this.interval && !force) return;

        // 点进去一下不进行记录 < 10s
        if (this.readSeconds <= 10000) return;

        const duration = Math.floor(this.readSeconds / 1000);
        if (duration > 0) {
            // console.log(`accumulateAndSend ${duration} seconds`);
            this.onUpdate?.(duration);
        }

        this.readSeconds = 0;
    }

    // -----------------------------
    // 销毁
    // -----------------------------
    public destroy() {
        this.accumulateAndSend(true);

        this.unbindEvents();
        if (this.tickId) clearInterval(this.tickId);
        if (this.idleTimeoutId) clearTimeout(this.idleTimeoutId);
    }
}
