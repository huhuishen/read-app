export function formatCompletion(complete: number | undefined) {
    if (!complete) return "0";

    return `${(complete * 100).toFixed(1)}`;
}

export function formatDuration(seconds: number | undefined) {
    if (!seconds) return "< 1 分钟";

    if (seconds < 3600) {
        return `${Math.ceil(seconds / 60)} 分钟`;
    } else {
        return `${(seconds / 3600.0).toFixed(1)} 小时`;
    }
}

export function formatDurationWithUnit(seconds?: number) {
    if (!seconds) return { value: "< 1", unit: "分钟" };

    if (seconds < 3600) {
        return { value: Math.ceil(seconds / 60).toString(), unit: "分钟" };
    } else {
        return { value: (seconds / 3600.0).toFixed(1), unit: "小时" };
    }
}