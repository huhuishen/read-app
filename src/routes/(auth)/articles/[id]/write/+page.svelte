<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import type { Article } from "$lib/models";
    import { toast } from "$lib/stores/toast.svelte";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import { stringSegment } from "$lib/util/client";
    import type { PageProps } from "./$types";
    import Editable from "./Editable.svelte";
    import EditableContent from "./EditableContent.svelte";
    import EditableTitle from "./EditableTitle.svelte";

    const { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    let article: Partial<Article> = $state(data.article);

    const api = createApi();

    let segments = $derived(stringSegment(article.content));
</script>

<svelte:head>
    <title>{article.title} - 编辑</title>
</svelte:head>

<!-- <Debug variable={article} /> -->
<!-- <Editor bind:article></Editor> -->

<EditableTitle bind:value={article.title} />
<!-- <EditableContent bind:segments /> -->
<Editable bind:value={article.content} />

<div class="footer mb4">
    <Button
        onclick={async () => {
            const r = await safeCall(
                api.post(`/api/articles/${article.id}`, article),
                toast,
            );

            if (r) {
                toast.show("编辑成功！", "success");
                goto(`/articles/${data.article.id}`);
            }
        }}>保存</Button
    >
</div>

<style>
    .footer {
        padding: 0 4rem;
    }
</style>
