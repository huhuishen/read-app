<script lang="ts">
    import { navigating } from "$app/state";
    import { browser } from "$app/environment";

    let visible = $state(false);
    let progress = $state(0);

    let timer: number | null = null;
    let hideTimer: number | null = null;

    function isActive() {
        return navigating !== null || loadingState.count > 0;
    }

    function start() {
        if (!browser) return;
        if (visible) return;

        visible = true;
        progress = 0.08;

        timer = window.setInterval(() => {
            progress = Math.min(progress + Math.random() * 0.1, 0.92);
        }, 200);
    }

    function finish() {
        if (!browser) return;

        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        progress = 1;

        hideTimer = window.setTimeout(() => {
            visible = false;
            progress = 0;
        }, 250);
    }

    $effect(() => {
        const nav = navigating;
        console.log(nav.from, nav.to, nav.complete);

        const active = nav !== null ;

        if (active) {
            start();
        } else {
            finish();
        }

        return () => {
            if (timer) clearInterval(timer);
            if (hideTimer) clearTimeout(hideTimer);
        };
    });
</script>

{#if visible}
    <div class="progress">
        <div class="bar" style="transform: scaleX({progress});" />
    </div>
{/if}

<style>
    .progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        z-index: 10000;
    }

    .bar {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6);

        transform-origin: left;
        transition: transform 180ms ease;
    }
</style>
