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
    RenderCache,
    cleanRenderCache,
} from "../internal/animate/state";

// TODO copy keyframes as soon as possible to make sure they aren't modified afterwards.
// TODO make sure callbacks don't fill up the stack.
// TODO defend against "bad" keyframes like negative timing.
// TODO keyframe callbacks

interface CallbackKeyframe extends Keyframe {
    callback?: () => void;
}

export interface CanvasKeyframe extends CallbackKeyframe {
    canvasOptions?: CanvasOptions;
}

export type CanvasAnimationKeyframe = CanvasKeyframe;

export interface CanvasAnimation {
    renderFrame(): Path2D;
    transition(...keyframes: CanvasKeyframe[]): void;
}

interface CallbackStore {
    [frameId: string]: () => void;
}

const removeExpiredFrameCallbacks = (
    frames: InternalKeyframe[],
    oldStore: CallbackStore,
): CallbackStore => {
    const newStore: CallbackStore = {};
    for (const frame of frames) {
        newStore[frame.id] = oldStore[frame.id];
    }
    return newStore;
};

const canvasBlobGenerator = (keyframe: CanvasKeyframe): Point[] => {
    return mapPoints(genFromOptions(keyframe.blobOptions), ({curr}) => {
        curr.x += keyframe?.canvasOptions?.offsetX || 0;
        curr.y += keyframe?.canvasOptions?.offsetY || 0;
        return curr;
    });
}

export const canvasPath = (): CanvasAnimation => {
    let internalFrames: InternalKeyframe[] = [];
    let renderCache: RenderCache = {};
    let callbackStore: CallbackStore = {};

    const renderFrame: CanvasAnimation["renderFrame"] = () => {
        const renderTime = Date.now();
        internalFrames = removeStaleFrames(internalFrames, renderTime);
        const renderOutput = renderFramesAt({
            renderCache: renderCache,
            timestamp: renderTime,
            currentFrames: internalFrames,
        });
        renderCache = renderOutput.renderCache;
        if (renderOutput.lastFrameId && callbackStore[renderOutput.lastFrameId]) {
            callbackStore[renderOutput.lastFrameId]();
            delete callbackStore[renderOutput.lastFrameId];
        }
        return renderPath2D(renderOutput.points);
    };

    const transition: CanvasAnimation["transition"] = (...keyframes) => {
        const transitionTime = Date.now();
        const transitionOutput = transitionFrames({
            renderCache: renderCache,
            timestamp: transitionTime,
            currentFrames: internalFrames,
            newFrames: keyframes,
            blobGenerator: canvasBlobGenerator,
        });
        renderCache = transitionOutput.renderCache;
        internalFrames = transitionOutput.newFrames;

        // Cleanup stored data that is no longer associated with a known frame.
        callbackStore = removeExpiredFrameCallbacks(internalFrames, callbackStore);
        renderCache = cleanRenderCache(internalFrames, renderCache);

        // Populate the callback using returned frame ids.
        for (const newFrame of internalFrames) {
            if (newFrame.transitionSourceFrameIndex === null) continue;
            const {callback} = keyframes[newFrame.transitionSourceFrameIndex];
            if (callback) callbackStore[newFrame.id] = callback;
        }
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
