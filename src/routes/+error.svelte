<script lang="ts">
    import { page } from "$app/state";

    const error = $derived(page.error as Error & { stack?: string; original?: unknown });
</script>

<div class="error">
    <h1>{page.status}</h1>
    <p>{error?.message}</p>
    <pre>{error?.stack}</pre>
    <pre>{String(error?.original ?? "")}</pre>
</div>

<style>
    .error {
        padding: 2rem;
    }

    pre {
        font-family: "Cascadia Mono";
        font-size: 16px;
        line-height: 1.5em;
        /* overflow: hidden;
        white-space: pre; */
    }
</style>
