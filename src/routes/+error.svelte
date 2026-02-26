<script lang="ts">
    import { page } from "$app/state";
</script>

<div class="error">
    <h1>{page.status}</h1>
    <p>{page.error?.message}</p>
    <pre>{page.error?.stack}</pre>
    <pre>{page.error?.original}</pre>
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
