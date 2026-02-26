export const loadingState = $state({
    count: 0
});

export function startLoading() {
    loadingState.count++;
    console.log(loadingState.count);
}

export function finishLoading() {
    loadingState.count = Math.max(0, loadingState.count - 1);
    console.log(loadingState.count);
}

export function isLoading() {
    return loadingState.count > 0;
}
