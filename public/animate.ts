import {CanvasOptions, BlobOptions} from "./blobs";
import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {
    InternalKeyframe,
    renderFramesAt,
    transitionFrames,
    Keyframe,
    RenderCache,
} from "../internal/animate/state";

// TODO make sure recursive callbacks don't fill up the stack.
interface CallbackKeyframe extends Keyframe {
    callback?: () => void;
}

export interface CanvasKeyframe extends CallbackKeyframe {
    blobOptions: BlobOptions;
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

const canvasBlobGenerator = (keyframe: CanvasKeyframe): Point[] => {
    return mapPoints(genFromOptions(keyframe.blobOptions), ({curr}) => {
        curr.x += keyframe?.canvasOptions?.offsetX || 0;
        curr.y += keyframe?.canvasOptions?.offsetY || 0;
        return curr;
    });
};

export const canvasPath = (): CanvasAnimation => {
    let internalFrames: InternalKeyframe[] = [];
    let renderCache: RenderCache = {};
    let callbackStore: CallbackStore = {};

    const renderFrame: CanvasAnimation["renderFrame"] = () => {
        const renderOutput = renderFramesAt({
            renderCache: renderCache,
            timestamp: Date.now(),
            currentFrames: internalFrames,
        });

        // Update render cache with returned value.
        renderCache = renderOutput.renderCache;

        // Invoke callback if defined and the first time the frame is reached.
        if (renderOutput.lastFrameId && callbackStore[renderOutput.lastFrameId]) {
            callbackStore[renderOutput.lastFrameId]();
            delete callbackStore[renderOutput.lastFrameId];
        }

        return renderPath2D(renderOutput.points);
    };

    const transition: CanvasAnimation["transition"] = (...keyframes) => {
        const transitionOutput = transitionFrames<CanvasKeyframe>({
            renderCache: renderCache,
            timestamp: Date.now(),
            currentFrames: internalFrames,
            newFrames: keyframes,
            shapeGenerator: canvasBlobGenerator,
        });

        // Reset internal state..
        internalFrames = transitionOutput.newFrames;
        callbackStore = {};
        renderCache = {};

        // Populate callback store using returned frame ids.
        for (const newFrame of internalFrames) {
            if (newFrame.isSynthetic) continue;
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
