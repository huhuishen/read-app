import type { User } from "$lib/models";

export const user = $state<Partial<User> | null>(null);


interface SessionState {
    user: Partial<User> | null;
    userstore: Partial<User> | null;
    initialized: boolean;
    visitorId: string;
    initialize: (user: Partial<User> | null) => void;
}

export const session = $state<SessionState>({
    get userstore() { return user; },

    user: null,

    initialized: false,

    visitorId: "",

    initialize(user: Partial<User> | null = null) {
        if (this.initialized) {
            return;
        }

        this.user = user;

        // const fp = await FingerprintJS.load();
        // const result = await fp.get();

        // this.visitorId = result.visitorId; // Stable device fingerprint

        // try {
        //     const response = await fetch("/api/auth/me", {
        //         method: "POST",
        //         credentials: "include", // 重要
        //     });

        //     if (response.ok) {
        //         this.user = await response.json();

        //         if (this.user?.visitorId !== this.visitorId) {
        //             // Optionally handle visitorId mismatch
        //             // console.warn("Visitor ID mismatch.", this.user?.visitorId, this.visitorId);
        //         }
        //     }
        // }
        // catch (e) {
        //     console.error("Error during session initialization:", e);
        // }

        this.initialized = true;
    },
});