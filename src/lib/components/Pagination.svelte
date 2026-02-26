<script lang="ts">
    interface Props {
        total?: number;
        limit?: number;
        page?: number;
        expand?: number;
        onPage?: ((n: number) => any) | null;
        formatUrl?: (n: number) => string;
    }

    let {
        total = 0,
        limit = 25,
        page = $bindable(1),
        expand = 3,
        onPage = null,
        formatUrl = (n) => {
            return n <= 0 || n >= total ? "#" : n.toString();
        },
    }: Props = $props();

    let pageCount = $derived(Math.ceil(total / limit));

    let pageStart = $derived.by(() => {
        if (expand * 2 + 1 > pageCount) {
            return 1;
        } else {
            if (page - expand < 1) {
                return 1;
            }
            if (page + expand > pageCount) {
                return pageCount - expand * 2 + 1;
            }
            return page - expand;
        }
    });

    let pageEnd = $derived.by(() => {
        if (expand * 2 + 1 > pageCount) {
            return pageCount;
        } else {
            if (page - expand < 1) {
                return expand * 2 + 1;
            }
            if (page + expand > pageCount) {
                return pageCount;
            }
            return page + expand;
        }
    });

    //                                      ( )pagepage
    //                               pageExpand  pageExpand
    //                               ------      -------
    // 当前页前后显示的可点击的页数 1...7 8 9 (10) 11 12 13...
    //                               -                 -
    //                                pageStart        pageEnd

    function setpage(n: number, e: MouseEvent) {
        if (onPage !== null) {
            e.preventDefault();

            if (n < 1) {
                n = 1;
            } else if (n > pageCount) {
                n = pageCount;
            }
            page = n;
            onPage?.(n);
        }
    }
</script>

<!-- svelte-ignore a11y_invalid_attribute -->
<div class="pagination" data-sveltekit-preload-data="off">
    <li class="page-item" class:disabled={page === 1}>
        <a
            href={formatUrl(page - 1)}
            tabindex={page === 1 ? -1 : null}
            onclick={(e) => setpage(page - 1, e)}>上一页</a
        >
    </li>
    {#if pageStart > 1}
        <li class="page-item">
            <a href={formatUrl(1)} onclick={(e) => setpage(1, e)}>1</a>
        </li>
    {/if}
    {#if pageStart > 2}
        <li class="page-item"><span>...</span></li>
    {/if}
    {#each Array.from({ length: pageEnd - pageStart + 1 }, (x, i) => i + pageStart) as n}
        <li class="page-item" class:active={page === n}>
            <a href={formatUrl(n)} onclick={(e) => setpage(n, e)}>{n}</a>
        </li>
    {/each}
    {#if pageEnd < pageCount - 1}
        <li class="page-item"><span>...</span></li>
    {/if}
    {#if pageEnd < pageCount}
        <li class="page-item" class:active={page === pageCount}>
            <a
                href={formatUrl(pageCount)}
                onclick={(e) => setpage(pageCount, e)}
                >{pageCount}
            </a>
        </li>
    {/if}
    <li class="page-item" class:disabled={page === pageCount}>
        <a
            href={formatUrl(page + 1)}
            tabindex={page === pageCount ? -1 : null}
            onclick={(e) => setpage(page + 1, e)}>下一页</a
        >
    </li>
</div>

<style>
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        list-style: none;
        flex-wrap: wrap;
        user-select: none;
        gap: 10px;
    }

    .page-item a {
        display: block;
        padding: 5px 10px;
        text-decoration: none;
        color: var(--text-color);
        border-radius: var(--radius);
    }

    .page-item:hover:not(.disabled, .active) a {
        color: var(--button-primary-hover);
        background-color: #e2eeff;
    }

    .active a {
        color: #fff;
        background-color: var(--button-primary);
        pointer-events: none;
    }

    .disabled a {
        color: #aaa;
        pointer-events: none;
    }
</style>
