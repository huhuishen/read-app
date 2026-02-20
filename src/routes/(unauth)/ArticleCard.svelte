<script lang="ts">
    interface Props {
        article: {
            title: string;
            author: string;
            id: string;
            coverImage: string;
        };
    }

    let { article }: Props = $props();
    //TODO：  href="/articles/{article.articleId}
</script>

<a class="book-card" href="/articles/{article.id}/summary">
    <div>
        {#if article.coverImage}
            <img
                src={article.coverImage}
                alt={article.title}
                class="flex book-cover"
            />
        {:else}
            <div class="flex book-cover placeholder">无封面</div>
        {/if}
        <div class="flex book-details">
            <h3>{article.title}</h3>
            <div class="flex comment-meta">
                <span>{article.author}</span>
            </div>
        </div>
    </div>
</a>

<style>
    .book-card {
        /* background: var(--reader-bg-color);
        color: var(--text-color);
        font-size: 16px;
        width: 25%;
        height: 350px;
        user-select: none;
        text-decoration: none;
        padding: 10px; */
        background: var(--reader-bg-color);
        color: var(--text-color);
        font-size: 16px;
        height: 350px;
        user-select: none;
        text-decoration: none;
        padding: 10px;
        max-width: 600px;
    }
    /* border: #eee solid 2px; */
    /* border-radius: 1rem; */
    /* box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); */
    /* max-width: 400px; */
    /* width: 100%; */
    /* transition: all 0.15s ease;
        transform-origin: center; */
    /* cursor: pointer; */

    .book-card:hover {
        background-color: rgba(141, 219, 255, 0.2);

        /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); */
        /* box-shadow: lightblue 0px 0px 0px; */
        /* border-color: var(--primary-color); */
        /* cursor: pointer; */
        /* transform: scale(1.02); */
        /* box-shadow: 0 0 0 4px rgba(0, 150, 255, 0.2); */
    }

    /* @media (max-width: 500px) {
        .book-card {
            width: 100%;
        }
    } */

    .book-cover {
        width: 100%;
        object-fit: cover;
        object-position: center;
        height: 200px;
        margin: 0 auto;
        cursor: pointer;
    }

    .book-cover.placeholder {
        height: 200px;
        justify-content: center;
        background: #ddd;
        color: #777;
    }

    .book-details {
        padding: 0 1rem;
        cursor: pointer;
        flex-direction: column;
    }

    .comment-meta {
        justify-content: space-between;
        cursor: pointer;
        color: var(--text-color);
    }

    h3 {
        color: var(--header-color);
        font-size: 20px;
        font-weight: bold;
        font-family: "Times New Roman", Times, serif;
    }
</style>
