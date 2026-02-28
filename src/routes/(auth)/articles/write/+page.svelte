<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Editor from "$lib/components/Editor.svelte";
    import type { Article } from "$lib/models";
    import { session } from "$lib/stores/session.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { nanoid } from "nanoid";
    import type { PageProps } from "./$types";
    import { createApi, safeCall } from "$lib/util/apiRequest";

    const { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    let article: Partial<Article> = $state({
        title: "",
        coverImage: "",
        summary: "",
        categories: [],
        content: "",
    });

    const api = createApi();
</script>

<svelte:head>
    <title>发表</title>
</svelte:head>

<main>
    <!-- <Debug variable={article} /> -->
    <Editor bind:article></Editor>
    <div class="footer">
        <Button
            onclick={async () => {
                const res = await safeCall(
                    api.post(`/api/articles`, article),
                    toast,
                );

                if (res) {
                    goto(`/articles/${res.id}`);
                    toast.show("发表成功！", "success");
                }
            }}>保存</Button
        >
    </div>
</main>

<style>
    .footer {
        padding: 0 4rem;
    }
</style>
