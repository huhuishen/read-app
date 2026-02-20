<script lang="ts">
    import TextBox from "./TextBox.svelte";
    import TagsManager from "./Tags.svelte";

    const { article = $bindable() } = $props();
    // console.log(article.tags);
    
    // const handleCoverImageChange = (event: Event) => {
    //     const target = event.target as HTMLInputElement;
    //     if (target.files && target.files[0]) {
    //         coverImageFile = target.files[0];
    //     }
    // };

    // const validateForm = () => {
    //     if (!title.trim()) {
    //         error = "书名不能为空";
    //         return false;
    //     }
    //     if (!author.trim()) {
    //         error = "作者不能为空";
    //         return false;
    //     }
    //     if (!content) {
    //         error = "请上传书籍内容";
    //         return false;
    //     }
    //     return true;
    // };

    // const readFileContent = (file: File): Promise<string> => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onload = (e) => resolve(e.target?.result as string);
    //         reader.onerror = reject;
    //         reader.readAsText(file);
    //     });
    // };

    // const submitForm = async () => {
    //     if (!validateForm()) return;

    //     isLoading = true;
    //     error = null;

    //     try {
    //         // 读取文本文件内容
    //         const formData = new FormData();
    //         formData.append("title", title);
    //         formData.append("author", author);
    //         formData.append("description", description);
    //         formData.append("category", category);
    //         formData.append("tags", tags);
    //         formData.append("isPublic", isPublic.toString());
    //         formData.append("uploader", currentUserId);
    //         formData.append("content", content);

    //         if (coverImageFile) {
    //             formData.append("coverImage", coverImageFile);
    //         }

    //         const response = await fetch("/api/books", {
    //             method: "POST",
    //             body: formData,
    //         });

    //         if (response.ok) {
    //             success = true;
    //             // dispatch("bookCreated");
    //             resetForm();
    //         } else {
    //             const result = await response.json();
    //             error = result.error || "创建书籍失败";
    //         }
    //     } catch (err) {
    //         error = err instanceof Error ? err.message : "上传失败";
    //     } finally {
    //         isLoading = false;
    //     }
    // };

    // const resetForm = () => {
    //     title = "";
    //     author = "";
    //     description = "";
    //     category = "";
    //     tags = "";
    //     isPublic = true;
    //     content = "";
    //     coverImageFile = null;
    // };
</script>

<div class="form-grid">
    <TextBox
        id={"title"}
        label={"书名 *"}
        bind:value={article.title}
        placeholder={"输入书名"}
    ></TextBox>
    <TextBox
        id={"coverImage"}
        label={"封面图片"}
        bind:value={article.coverImage}
        placeholder={"封面图片 URL"}
    ></TextBox>
    <!-- <div class="form-group">
        <label for="category">分类</label>
        <input
            id="category"
            type="text"
            bind:value={article.category}
            placeholder="输入分类"
        />
    </div> -->

    <!-- <div class="form-group">
        <label for="tags">标签</label>
        <input
            id="tags"
            type="text"
            bind:value={article.tags}
            placeholder="输入标签，用逗号分隔"
        />
    </div> -->

    <!-- <div class="form-group">
        <label for="isPublic">状态</label>
        <select id="isPublic" bind:value={article.isPublic}>
            <option value={true}>公开</option>
            <option value={false}>私有</option>
        </select>
    </div> -->
    <TextBox
        id={"bref"}
        label={"简介"}
        type="textarea"
        bind:value={article.summary}
        placeholder={"输入书籍简介"}
    ></TextBox>

    <TagsManager
        bind:tags={article.categories}
        suggestions={["数字生命", "机械飞升"]}
        locked={["五十五届零重力杯"]}
    />

    <TextBox
        id={"content"}
        label={"内容"}
        type="textarea"
        bind:value={article.content}
        placeholder={"输入书籍内容"}
    ></TextBox>
</div>

<!-- <div class="form-actions">
    <button type="submit" disabled={isLoading} class="btn-primary">
        {isLoading ? "创建中..." : "创建书籍"}
    </button>
</div> -->

<style>
    .form-grid {
        display: flex;
        flex-direction: column;
        margin: 4rem 0;
        padding: 0 4rem;
        gap: 1rem;
    }
</style>
