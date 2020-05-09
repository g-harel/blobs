import {Point} from "../types";
import {RenderCache, InternalKeyframe, renderFramesAt, transitionFrames, Keyframe} from "./frames";
import {typeCheck, error} from "../errors";
import {timingFunctions} from "./timing";

interface CallbackKeyframe extends Keyframe {
    callback?: () => void;
}

interface CallbackStore {
    [frameId: string]: () => void;
}

export const statefulAnimationGenerator = <K extends CallbackKeyframe, T>(
    generator: (keyframe: K) => Point[],
    renderer: (points: Point[]) => T,
    checker: (keyframe: K, index: number) => void,
) => () => {
    let internalFrames: InternalKeyframe[] = [];
    let renderCache: RenderCache = {};
    let callbackStore: CallbackStore = {};

    const renderFrame = (): T => {
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

        return renderer(renderOutput.points);
    };

    const transition = (...keyframes: K[]) => {
        // Make sure frame info is valid.
        for (let i = 0; i < keyframes.length; i++) {
            typeCheck(`keyframe[${i}]`, keyframes[i], ["object"]);
            const {delay, duration, timingFunction, callback} = keyframes[i];
            typeCheck(`keyframe[${i}].delay`, delay, ["number", "undefined"]);
            if (delay && delay < 0) error(`keyframe[${i}].delay is invalid "${delay}".`);
            typeCheck(`keyframe[${i}].duration`, duration, ["number"]);
            if (duration && duration < 0)
                error(`keyframe[${i}].duration is invalid "${duration}".`);
            typeCheck(`keyframe[${i}].timingFunction`, timingFunction, ["string", "undefined"]);
            if (timingFunctions[timingFunction || "linear"] === undefined) {
                error(`"keyframe[${i}].timingFunction" is not recognized "${timingFunction}".`);
            }
            typeCheck(`keyframe[${i}].callback`, callback, ["function", "undefined"]);
            checker(keyframes[i], i);
        }

        const transitionOutput = transitionFrames<K>({
            renderCache: renderCache,
            timestamp: Date.now(),
            currentFrames: internalFrames,
            newFrames: keyframes,
            shapeGenerator: generator,
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
