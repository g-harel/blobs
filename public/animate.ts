import {BlobOptions, CanvasOptions} from "./blobs";

// TODO copy keyframes as soon as possible to make sure they aren't modified afterwards.
// TODO make sure callbacks don't fill up the stack.

interface BaseKeyframe {
    blobOptions: BlobOptions;
}

interface KeyframeTiming {
    delay?: number;
    duration: number;
    timingFunction?: "ease" | "linear" | "bounce"; // ...
    callback?: () => void;
}

interface KeyframeCanvasOptions {
    canvasOptions?: CanvasOptions;
}

interface Animation<T, K> {
    renderFrame(): T;
    start(keyframe: BaseKeyframe & K): Animation<T, K>;
    clear(): void;
    transition(...keyframes: (BaseKeyframe & K & KeyframeTiming)[]): void;
}

// TODO implement
export const canvasPath = (): Animation<Path2D, KeyframeCanvasOptions> => ({} as any);

// TODO remove, for testing
const blobs2Animate = {canvasPath};

/////////////
// example //
/////////////

const canvas = document.getElementById("canvas") as any;
const ctx = canvas.getContext("2d");

const animation = blobs2Animate.canvasPath();
window.requestAnimationFrame(() => {
    ctx.fill(animation.renderFrame());
});

animation.start({
    blobOptions: {
        extraPoints: 3,
        randomness: 3,
        seed: "start",
        size: 200,
    },
});

const loop = () => {
    animation.transition(
        {
            duration: 2000,
            blobOptions: {
                extraPoints: 3,
                randomness: 3,
                seed: "blob1",
                size: 200,
            },
        },
        {
            duration: 2000,
            callback: loop,
            blobOptions: {
                extraPoints: 3,
                randomness: 3,
                seed: "blob2",
                size: 200,
            },
        },
    );
};

const button = document.getElementById("button") as any;
button.onclick(() => {
    animation.transition(
        {
            duration: 100,
            callback: loop,
            blobOptions: {
                extraPoints: 3,
                randomness: 7,
                seed: "onClick",
                size: 200,
            },
        },
    );
})
