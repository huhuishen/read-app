<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";

    let {
        search = $bindable(),
        count,
        onSearch,
    }: {
        search: string;
        count?: number;
        onSearch?: (s: string) => void;
    } = $props();
</script>

<label class="flex">
    <!-- <Icon name="search" className="mr-1" fill="#888"></Icon> -->
    <div class="input-wrap">
        <input
            type="text"
            name="search"
            bind:value={search}
            placeholder={count ? `搜索 ${count} 项...` : "搜索..."}
            onkeydown={(e) => {
                if (e.key === "Enter") {
                    // goto(`/?s=${encodeURIComponent(search)}`);
                    onSearch?.(search);
                }
            }}
        />

        <svg
            class="cross-icon"
            aria-hidden="true"
            onclick={() => {
                search = "";
                onSearch?.(search);
            }}
        >
            <use href="#cross" />
        </svg>
    </div>
</label>

<style>
    ::placeholder {
        font-style: italic;
    }

    .input-wrap {
        position: relative;
        /* display: inline-block; */
        width: 240px;
    }

    .cross-icon {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        fill: #888;
        pointer-events: auto;
        cursor: pointer;
    }
</style>
