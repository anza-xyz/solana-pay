declare global {
    interface Document {
        readonly webkitFullscreenElement: Element | null;
        readonly mozFullScreenElement: Element | null;
        readonly msFullscreenElement: Element | null;

        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
    }

    interface HTMLElement {
        webkitRequestFullscreen(options?: FullscreenOptions): Promise<void>;
        mozRequestFullScreen(options?: FullscreenOptions): Promise<void>;
        msRequestFullscreen(options?: FullscreenOptions): Promise<void>;
    }
}

export function toggleFullscreen() {
    if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.fullscreenElement
    ) {
        const exitFullscreen =
            document.exitFullscreen ||
            document.webkitExitFullscreen ||
            document.mozCancelFullScreen ||
            document.msExitFullscreen;
        if (exitFullscreen) {
            exitFullscreen.call(document).catch((error) => console.warn(error));
        }
    } else {
        const requestFullscreen =
            document.documentElement.requestFullscreen ||
            document.documentElement.webkitRequestFullscreen ||
            document.documentElement.mozRequestFullScreen ||
            document.documentElement.msRequestFullscreen;
        if (requestFullscreen) {
            requestFullscreen.call(document.documentElement).catch((error) => console.warn(error));
        }
    }
}
