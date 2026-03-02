<script lang="ts">
    let {
        article,
        showCover = true,
    }: {
        article: {
            title: string;
            author: string;
            id: string;
            coverImage?: string;
        };
        showCover?: boolean;
    } = $props();
    // TODO: href="/articles/{article.articleId}"
</script>

<a class="book-card" href="/articles/{article.id}/summary">
    <div
        class="flex book-layout"
        class:layout-top={showCover}
        class:layout-left={!showCover}
    >
        {#if article.coverImage}
            <img
                src={article.coverImage}
                alt={article.title}
                class="flex book-cover"
                class:book-cover-top={showCover}
                class:book-cover-left={!showCover}
            />
        {:else}
            <div
                class="flex book-cover placeholder"
                class:book-cover-top={showCover}
                class:book-cover-left={!showCover}
            >
                No cover
            </div>
        {/if}
        <div class="flex book-details" class:book-details-left={!showCover}>
            <h3 class="title">{article.title}</h3>
            <div class="flex comment-meta">
                <span>{article.author}</span>
            </div>
        </div>
    </div>
</a>

<style>
    .book-card {
        background: var(--main-bg-color);
        color: var(--text-color);
        font-size: 16px;
        max-height: 360px;
        user-select: none;
        text-decoration: none;
        padding: 10px;
        max-width: 600px;
    }

    .book-card:hover {
        background-color: var(--accent-soft);
    }

    .book-layout.layout-top {
        flex-wrap: wrap;
    }

    .book-layout.layout-left {
        flex-wrap: nowrap;
        gap: 10px;
    }

    .book-cover {
        object-fit: cover;
        object-position: center;
        margin: 0 auto;
        cursor: pointer;
    }

    .book-cover-top {
        width: 100%;
        height: 200px;
    }

    .book-cover-left {
        flex: 0 0 48%;
        width: 48%;
        height: 130px;
        margin: 0;
    }

    .book-cover.placeholder {
        justify-content: center;
        background: var(--border-default);
        color: var(--link-color);
    }

    .book-details {
        padding: 0 1rem;
        cursor: pointer;
        flex-direction: column;
        height: 130px;
        width: 100%;
        min-width: 0;
    }

    .book-details-left {
        flex: 1 0 52%;
        min-height: 130px;
        padding: 0 0.5rem;
        flex-direction: column;
        align-items: flex-start;
    }

    .comment-meta {
        justify-content: space-between;
        cursor: pointer;
        color: var(--text-color);
    }
    .title {
        color: var(--header-color);
        font-size: 20px;
        font-weight: bold;
        font-family: "Times New Roman", Times, serif;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .book-details-left .title {
        width: 100%;
    }
</style>
