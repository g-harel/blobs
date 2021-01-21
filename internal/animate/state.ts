import {Point} from "../types";
import {RenderCache, InternalKeyframe, renderFramesAt, transitionFrames, Keyframe} from "./frames";

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

    // Keep track of paused state.
    // TODO fix
    let pausedAt = 0;
    let pauseOffset = 0;

    const play = () => {
        console.log("play");
        if (pausedAt === 0) return;
        pauseOffset += Date.now() - pausedAt;
        pausedAt = 0;
    };

    const pause = () => {
        console.log("pause");
        pausedAt = Date.now();
    };

    const playPause = () => {
        if (pausedAt === 0) {
            pause();
        } else {
            play();
        }
    };

    const renderFrame = (): T => {
        const renderOutput = renderFramesAt({
            renderCache: renderCache,
            timestamp: pausedAt === 0 ? Date.now() - pauseOffset : pausedAt,
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
            checker(keyframes[i], i);
        }

        const transitionOutput = transitionFrames<K>({
            renderCache: renderCache,
            timestamp: Date.now() - pauseOffset,
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

    return {renderFrame, transition, play, pause, playPause};
};
