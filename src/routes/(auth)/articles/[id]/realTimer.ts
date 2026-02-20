export class ReadTimer {
    private interval: number;
    private idleThreshold: number;

    private readSeconds = 0; // 总累计秒数
    private active = false;

    private lastActiveTime = Date.now();
    private idleTimeoutId: number | null = null;
    private tickId: number | null = null;

    private onUpdate: (t: number) => void;

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
            window.addEventListener(e, () => this.onUserActivity(), true)
        );

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                this.markInactive();
            } else {
                this.markActive();
            }
        });

        window.addEventListener("blur", () => {
            this.markInactive();
        });

        // 如果页面即将卸载，强制发送剩余时间
        window.addEventListener("beforeunload", () => {
            // this.accumulateAndSend(true);
            // 换用下行，禁止发送过短（< 60s）的阅读时间
            this.accumulateAndSend();
        });
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
        if (this.tickId) clearInterval(this.tickId);
        if (this.idleTimeoutId) clearTimeout(this.idleTimeoutId);
    }
}
