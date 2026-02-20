<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Editor from "$lib/components/Editor.svelte";
    import type { Article } from "$lib/models";
    import { session } from "$lib/stores/session.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { nanoid } from "nanoid";
    import type { PageProps } from "../articles/write/$types";

    const { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    let article: Partial<Article> = $state({
        articleId: nanoid(),
        version: 0,
        status: "draft",
        isLatest: true,
        title: "",
        authorId: session.user?.id,
        author: session.user?.name,
        coverImage: "",
        summary: "",
        categories: ["五十五届零重力杯"],
        content: "",
        nView: 0,
        nBookmark: 0,
        nComment: 0,
    });
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
                try {
                    // console.log($state.snapshot(article));
                    const r = await fetch(`/api/article`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(article),
                    });

                    if (r.ok) {
                        var res = await r.json();
                        goto(`/article/${article.articleId}`);
                        toast.show("发表成功！", "success");
                    } else {
                        var error = await r.json();
                        toast.show(error.error, "error");
                    }
                } catch (e) {
                    toast.show(JSON.stringify(e), "error");
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
