export function isInput(element: any) {
    let tagName =
        element && element.tagName ? element.tagName.toLowerCase() : "";

    return (
        tagName === "input" ||
        tagName === "select" ||
        tagName === "textarea" ||
        element.isContentEditable
    );
}

export function trapFocus(modal: HTMLElement) {
    const focusableSelectors =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';
    const focusableEls = Array.from(
        modal.querySelectorAll(focusableSelectors),
    ) as HTMLElement[];

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    function handleTab(e: KeyboardEvent) {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
            if (document.activeElement === firstEl) {
                lastEl.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastEl) {
                firstEl.focus();
                e.preventDefault();
            }
        }
    }

    modal.addEventListener("keydown", handleTab);

    return () => {
        modal.removeEventListener("keydown", handleTab);
    };
}


export function isInViewport(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
    );
}