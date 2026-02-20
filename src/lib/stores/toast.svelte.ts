export interface ToastState {
    message: string | null;
    type: "info" | "success" | "warn" | "error";
    visible: boolean;
    countdown: number;
    skipSuccess: boolean;
    show: (msg: string, msgType?: "info" | "success" | "warn" | "error") => void;
    hide: () => void;
}

let timer: ReturnType<typeof setInterval> | null = null;
let seconds = 5;
let showCouterdown = false;


export const toast = $state<ToastState>({
    message: null,

    type: "info",

    visible: false,

    skipSuccess: false,

    countdown: 0,

    show(msg: string, msgType = "info") {
        if (this.skipSuccess && msgType === "success") {
            this.visible = false;
            return;
        }

        this.type = msgType;
        // message = `${msgType}: ${msg}`;
        this.message = showCouterdown ? `${msg} (${this.countdown})` : msg;

        this.visible = true;

        if (timer) {
            clearInterval(timer);
        }

        this.countdown = seconds;
        timer = setInterval(() => {
            this.countdown -= 1;

            if (this.countdown <= 0) {
                clearInterval(timer!);
                this.hide();
            }
        }, 1000);
    },

    hide() {
        this.visible = false;
        timer = null;
    },
});