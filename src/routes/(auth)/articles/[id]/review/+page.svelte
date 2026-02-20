<script lang="ts">
    import { page } from "$app/state";
    import Button from "$lib/components/Button.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    // svelte-ignore state_referenced_locally
    const { article, comments, user } = data;

    const lastSlashIndex = page.url.pathname.lastIndexOf("/");
    const parentUrl = page.url.pathname.substring(0, lastSlashIndex);

    let comment = $state("");
    let rating = $state(0);
</script>

<svelte:head>
    <title>{article.title} - 评论</title>
</svelte:head>

<main>
    <div class="content">
        <h1 class="mb4"><a href={parentUrl}>{article.title}</a></h1>
        <h2>审核结论</h2>
        <section class="flex rating">
            <label for="">通过</label>
            <input type="radio" />
            <input type="radio" />
        </section>
        <textarea
            id="textarea"
            placeholder="反馈给作者的信息"
            bind:value={comment}
            tabindex="0"
        ></textarea>
        <div class="flex mb4">
            <Button
                disabled={comment.length === 0}
                onclick={async () => {
                    try {
                    } catch (error) {
                        console.log(error);
                    }
                }}>提交</Button
            >
        </div>
    </div>
</main>

<style>
    a {
        text-decoration: none;
        font-weight: 300;
        font-size: 32px;
        margin: 2rem 0;
        color: var(--header-color);
    }

    h2 {
        font-weight: 400;
        font-size: 24px;
        margin: 2rem 0;
    }

    .rating {
        margin: 1rem 0;
        gap: 20px;
    }

    textarea {
        outline: none;
        /* border: none; */
        box-sizing: border-box;
        padding: 8px;
        font-size: 14px;
        width: 100%;
        resize: none;
        line-height: 20px;
        min-height: 20px;
        overflow-y: auto;
        max-height: 100px;
    }
</style>
