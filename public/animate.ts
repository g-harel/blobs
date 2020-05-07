import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {
    InternalKeyframe,
    renderFramesAt,
    transitionFrames,
    RenderCache,
} from "../internal/animate/state";

// TODO make sure recursive callbacks don't fill up the stack.

export interface CanvasKeyframe {
    delay?: number;
    duration: number;
    timingFunction?:
        | "linear"
        | "easeIn"
        | "easeOut"
        | "easeInOut"
        | "elasticIn0"
        | "elasticIn1"
        | "elasticIn2"
        | "elasticIn3"
        | "elasticOut0"
        | "elasticOut1"
        | "elasticOut2"
        | "elasticOut3";
    callback?: () => void;
    blobOptions: {
        seed: number | string;
        randomness: number;
        extraPoints: number;
        size: number;
    };
    canvasOptions?: {
        offsetX?: number;
        offsetY?: number;
    };
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
