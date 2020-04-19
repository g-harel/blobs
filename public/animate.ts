import {BlobOptions, CanvasOptions} from "./blobs";
import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {interpolateBetween} from "../internal/animate/interpolate";
import {InterpolationFunc} from "../internal/animate/types";

// TODO copy keyframes as soon as possible to make sure they aren't modified afterwards.
// TODO make sure callbacks don't fill up the stack.

interface Keyframe {
    delay?: number;
    duration: number;
    timingFunction?: "ease" | "linear" | "bounce"; // ...
    // Not guaranteed to run if interrupted.
    callback?: () => void;
    blobOptions: BlobOptions;
}

export interface CanvasKeyframe extends Keyframe {
    canvasOptions?: CanvasOptions;
}

export type CanvasAnimationKeyframe = CanvasKeyframe;

export interface CanvasAnimation {
    renderFrame(): Path2D;
    transition(...keyframes: CanvasKeyframe[]): void;
}

interface InternalKeyframe {
    timestamp: number;
    timingFunction: InterpolationFunc;
    cancelTimeouts: () => void;
    initialPoints: Point[];
    preparedPoints?: Point[];
}

export const canvasPath = (): CanvasAnimation => {
    let internalFrames: InternalKeyframe[] = [];
    // TODO timing state
    // TODO store current blob when interrupts happen to use as source.

    const genBlob = (keyframe: CanvasKeyframe): Point[] =>
        mapPoints(genFromOptions(keyframe.blobOptions), ({curr}) => {
            curr.x += keyframe?.canvasOptions?.offsetX || 0;
            curr.y += keyframe?.canvasOptions?.offsetY || 0;
            return curr;
        });

    const renderFrame: CanvasAnimation["renderFrame"] = () => {
        // When transition was called with no frames.
        if (internalFrames.length === 0) return new Path2D();

        const renderTime = Date.now();

        // Remove old frames.
        while (internalFrames.length > 0 && internalFrames[0].timestamp < renderTime) {
            internalFrames.shift();
        }

        // Remove frames when they are no longer needed. At least one past frame is needed to
        // interpolate from it to the next frame.
        while (true) {
            if (internalFrames.length <= 1) break;
            if (internalFrames[1].timestamp > renderTime) break;
            internalFrames.shift();
        }

        // Animation freezes at the final shape if there are no more keyframes.
        if (internalFrames.length === 1) return renderPath2D(internalFrames[0].initialPoints);

        return renderPath2D(interpolateBetween(0.5, internalFrames[0].preparedPoints, internalFrames[1].preparedPoints));
    };

    const transition: CanvasAnimation["transition"] = () => {};

    return {renderFrame, transition};
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

animation.transition({
    duration: 0,
    callback: loop,
    blobOptions: {
        extraPoints: 3,
        randomness: 3,
        seed: "start",
        size: 200,
    },
});

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
