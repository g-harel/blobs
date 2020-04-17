import {BlobOptions, CanvasOptions} from "./blobs";
import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {interpolateBetween} from "../internal/animate/interpolate";

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

export type CanvasAnimationStartKeyframe = BaseKeyframe & KeyframeCanvasOptions;
export type CanvasAnimationKeyframe = CanvasAnimationStartKeyframe & KeyframeTiming;

export interface CanvasAnimation {
    renderFrame(): Path2D;
    start(keyframe: CanvasAnimationStartKeyframe): void;
    clear(): void;
    transition(...keyframes: CanvasAnimationKeyframe[]): void;
}

export const canvasPath = (): CanvasAnimation => {
    let nextShapes: Point[][] = [];
    // TODO timing state
    // TODO store current blob when interrupts happen to use as source.

    const genBlob = (keyframe: CanvasAnimationStartKeyframe): Point[] =>
        mapPoints(genFromOptions(keyframe.blobOptions), ({curr}) => {
            curr.x += keyframe?.canvasOptions?.offsetX || 0;
            curr.y += keyframe?.canvasOptions?.offsetY || 0;
            return curr;
        });

    const renderFrame: CanvasAnimation["renderFrame"] = () => {
        if (nextShapes.length === 0) return new Path2D();
        if (nextShapes.length === 1) return renderPath2D(nextShapes[0]);
        return renderPath2D(interpolateBetween(0.5, nextShapes[0], nextShapes[1]));
    };

    const start: CanvasAnimation["start"] = (keyframe) => {
        if (nextShapes.length !== 0) throw `(blobs2) Animation is already started.`;
        nextShapes = [genBlob(keyframe)];
    };

    const clear: CanvasAnimation["clear"] = () => {
        nextShapes = [];
    };

    const transition: CanvasAnimation["transition"] = () => {};

    return {renderFrame, start, clear, transition};
};

/////////////
// example //
/////////////

// TODO remove
const blobs2Animate = {canvasPath};

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
    animation.transition({
        duration: 100,
        callback: loop,
        blobOptions: {
            extraPoints: 3,
            randomness: 7,
            seed: "onClick",
            size: 200,
        },
    });
});
