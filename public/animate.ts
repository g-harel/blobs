import {CanvasOptions} from "./blobs";
import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {
    InternalKeyframe,
    renderFramesAt,
    transitionFrames,
    Keyframe,
    removeStaleFrames,
} from "../internal/animate/state";

// TODO copy keyframes as soon as possible to make sure they aren't modified afterwards.
// TODO make sure callbacks don't fill up the stack.
// TODO defend against "bad" keyframes like negative timing.
// TODO keyframe callbacks

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

    const genBlob = (keyframe: CanvasKeyframe): Point[] =>
        mapPoints(genFromOptions(keyframe.blobOptions), ({curr}) => {
            curr.x += keyframe?.canvasOptions?.offsetX || 0;
            curr.y += keyframe?.canvasOptions?.offsetY || 0;
            return curr;
        });

    const renderFrame: CanvasAnimation["renderFrame"] = () => {
        const renderTime = Date.now();
        internalFrames = removeStaleFrames(internalFrames, renderTime);
        return renderPath2D(renderFramesAt(internalFrames, renderTime));
    };

    const transition: CanvasAnimation["transition"] = (...keyframes) => {
        const transitionTime = Date.now();

        // Immediately wipe animation when given no keyframes.
        if (keyframes.length === 0) {
            internalFrames = [];
            return;
        }

        internalFrames = transitionFrames(internalFrames, keyframes, transitionTime);
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
