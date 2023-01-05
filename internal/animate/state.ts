import {Point} from "../types";
import {RenderCache, InternalKeyframe, renderFramesAt, transitionFrames, Keyframe} from "./frames";

interface CallbackKeyframe extends Keyframe {
    callback?: () => void;
}

interface FrameCallbackStore {
    [frameId: string]: () => void;
}

export const statefulAnimationGenerator =
    <K extends CallbackKeyframe, T>(
        generator: (keyframe: K) => Point[],
        renderer: (points: Point[]) => T,
        checker: (keyframe: K, index: number) => void,
    ) =>
    (timestampProvider: () => number) => {
        let internalFrames: InternalKeyframe[] = [];
        let renderCache: RenderCache = {};
        let frameCallbackStore: FrameCallbackStore = {};

        // Keep track of paused state.
        let pausedAt = 0;
        let pauseOffset = 0;
        const getAnimationTimestamp = () => timestampProvider() - pauseOffset;
        const isPaused = () => pausedAt !== 0;

        const play = () => {
            if (!isPaused()) return;
            pauseOffset += getAnimationTimestamp() - pausedAt;
            pausedAt = 0;
        };

        const pause = () => {
            if (isPaused()) return;
            pausedAt = getAnimationTimestamp();
        };

        const playPause = () => {
            if (isPaused()) {
                play();
            } else {
                pause();
            }
        };

        const renderFrame = (): T => {
            const renderOutput = renderFramesAt({
                renderCache: renderCache,
                timestamp: isPaused() ? pausedAt : getAnimationTimestamp(),
                currentFrames: internalFrames,
            });

            // Update render cache with returned value.
            renderCache = renderOutput.renderCache;

            // Invoke callback if defined and the first time the frame is reached.
            if (renderOutput.lastFrameId && frameCallbackStore[renderOutput.lastFrameId]) {
                frameCallbackStore[renderOutput.lastFrameId]();
                delete frameCallbackStore[renderOutput.lastFrameId];
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
                timestamp: getAnimationTimestamp(),
                currentFrames: internalFrames,
                newFrames: keyframes,
                shapeGenerator: generator,
            });

            // Reset internal state..
            internalFrames = transitionOutput.newFrames;
            frameCallbackStore = {};
            renderCache = {};

            // Populate callback store using returned frame ids.
            for (const newFrame of internalFrames) {
                if (newFrame.isSynthetic) continue;
                const {callback} = keyframes[newFrame.transitionSourceFrameIndex];
                if (callback) frameCallbackStore[newFrame.id] = callback;
            }
        };

        return {renderFrame, transition, play, pause, playPause};
    };
