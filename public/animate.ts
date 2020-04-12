/*
// API
interface Keyframe {
    duration: number;
    easing: "ease" | "linear" | "bounce"; // ...
    blobOptions: BlobOptions;
}
interface CanvasKeyframe extends Keyframe {
    canvasOptions: CanvasOptions;
}
interface Animation<K extends Keyframe, T = void> {
    start(blobOptions: BlobOptions, otherOptions: T) => Animation<T>;
    // TODO how to handle interrupts
    // TODO remove keyframe type
    wait(delay: number) => Promise<Animation<T>>;
    next(keyframe: K) => Promise<Animation<T>>;
}
export const canvasPath(callback: (path: Path2D) => void) => Animation<CanvasKeyframe, CanvasOptions>;

// example
const animation = animate.canvasPath(callback);
animation.start(blobOptions, canvasOptions);
animation.next(keyframe);

*/
