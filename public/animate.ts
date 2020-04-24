import {BlobOptions, CanvasOptions} from "./blobs";
import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {InternalKeyframe, removeStale, renderAt, cancelTimeouts} from "../internal/animate/state";

// TODO copy keyframes as soon as possible to make sure they aren't modified afterwards.
// TODO make sure callbacks don't fill up the stack.
// TODO defend against "bad" keyframes like negative timing.

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

export const canvasPath = (): CanvasAnimation => {
    let internalFrames: InternalKeyframe[] = [];
    // TODO store current blob when interrupts happen to use as source.

    const genBlob = (keyframe: CanvasKeyframe): Point[] =>
        mapPoints(genFromOptions(keyframe.blobOptions), ({curr}) => {
            curr.x += keyframe?.canvasOptions?.offsetX || 0;
            curr.y += keyframe?.canvasOptions?.offsetY || 0;
            return curr;
        });

    const renderFrame: CanvasAnimation["renderFrame"] = () => {
        const renderTime = Date.now();
        // No need to cancel any timeouts since stale frames have passed.
        internalFrames = removeStale(internalFrames, renderTime);
        return renderPath2D(renderAt(internalFrames, renderTime));
    };

    const transition: CanvasAnimation["transition"] = (...keyframes) => {
        // Immediately wipe animation when given no keyframes.
        if (keyframes.length === 0) {
            cancelTimeouts(internalFrames);
            internalFrames = [];
            return;
        }

        cancelTimeouts(internalFrames);

        const transitionTime = Date.now();
        let totalTime = 0;

        // Add current state as initial frame.
        internalFrames = [
            {
                cancelTimeouts: () => {},
                initialPoints: renderAt(internalFrames, transitionTime),
                timestamp: transitionTime,
                timingFunction: (p) => p,
            },
        ];
        for (let i = 0; i < keyframes.length; i++) {
            const keyframe = keyframes[i];
            if (keyframe.delay && i > 0) {
            }
        }
        // TODO generate internal frames. Delayed frames can just copy the previous one.
    };

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
