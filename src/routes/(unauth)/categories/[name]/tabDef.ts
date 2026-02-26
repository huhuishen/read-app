export function getTabs(award: boolean | undefined) {
    if (award) {
        return [
            { key: "articles", label: "作品" },
            { key: "votes", label: "投票" },
        ];
    } else {
        return [{ key: "articles", label: "作品" }];
    }
}