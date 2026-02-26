<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import Toast from "$lib/components/Toast.svelte";
    import "$lib/styles/base.css";
    import "$lib/styles/app.css";
    import icons from "$lib/assets/icons.svg?raw";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    
    let { data, children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{@html icons}

<!-- <ProgressBar /> -->
{@render children()}
<Toast></Toast>
