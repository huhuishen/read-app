export function shouldHidePreviewAuthor(voteEnd?: Date) {
    if (!voteEnd) return false;
    const voteEndTime = voteEnd instanceof Date ? voteEnd.getTime() : new Date(voteEnd).getTime();
    if (Number.isNaN(voteEndTime)) return false;
    return Date.now() < voteEndTime;
}

export function sanitizeCategoryPreviewAuthors<T extends { voteEnd?: Date; previewArticles?: Array<Record<string, unknown>> }>(category: T): T {
    if (!shouldHidePreviewAuthor(category.voteEnd) || !category.previewArticles) {
        return category;
    }

    return {
        ...category,
        previewArticles: category.previewArticles.map(({ author, ...article }) => article),
    };
}