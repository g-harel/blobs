import {TimingFunc, timingFunctions} from "./timing";
import {Point} from "../types";
import {prepare} from "./prepare";
import {interpolateBetween} from "./interpolate";
import {BlobOptions} from "../../public/blobs";

export interface Keyframe {
    delay?: number;
    duration: number;
    timingFunction?: keyof typeof timingFunctions;
    blobOptions: BlobOptions;
}

export interface InternalKeyframe {
    id: string;
    timestamp: number;
    timingFunction: TimingFunc;
    initialPoints: Point[];
    transitionSourceFrameIndex: number | null;
}

export interface RenderCache {
    [frameId: string]: {
        preparedEndPoints?: Point[];
        preparedStartPoints?: Point[];
    };
}

export interface RenderInput {
    currentFrames: InternalKeyframe[];
    timestamp: number;
    renderCache: RenderCache;
}

export interface RenderOutput {
    points: Point[];
    lastFrameId: string | null;
    renderCache: RenderCache;
}

export interface TransitionInput extends RenderInput {
    newFrames: Keyframe[];
    blobGenerator: <T extends Keyframe>(options: T) => Point[],
}

export interface TransitionOutput {
    newFrames: InternalKeyframe[];
    renderCache: RenderCache;
}

const genId = (): string => {
    return String(Math.random()).substr(2);
};

export const removeStaleFrames = (
    keyframes: InternalKeyframe[],
    timestamp: number,
): InternalKeyframe[] => {
    if (keyframes.length <= 1) return keyframes;
    const staleCount = keyframes.filter((k) => k.timestamp < timestamp).length;
    // Keep a single stale frame for the current transition.
    return keyframes.slice(staleCount - 1);
};

export const cleanRenderCache = (
    keyframes: InternalKeyframe[],
    renderCache: RenderCache,
): RenderCache => {
    const newCache: RenderCache = {};
    for (const frame of keyframes) {
        newCache[frame.id] = renderCache[frame.id];
    }
    return newCache;
}

export const renderFramesAt = (input: RenderInput): RenderOutput => {
    const {renderCache, currentFrames} = input;

    if (currentFrames.length === 0) {
        return {renderCache, lastFrameId: null, points: []};
    }

    // Animation freezes at the final shape if there are no more keyframes.
    if (currentFrames.length === 1) {
        const first = currentFrames[0];
        return {renderCache, lastFrameId: first.id, points: first.initialPoints};
    }

    // Find the start/end keyframes according to the timestamp.
    let startKeyframe = currentFrames[0];
    let endKeyframe = currentFrames[1];
    for (let i = 2; i < currentFrames.length; i++) {
        if (endKeyframe.timestamp < input.timestamp) break;
        startKeyframe = currentFrames[i - 1];
        endKeyframe = currentFrames[i];
    }

    // Use and cache prepared points for current interpolation.
    let preparedStartPoints: Point[] | undefined = renderCache[startKeyframe.id].preparedStartPoints;
    let preparedEndPoints: Point[] | undefined = renderCache[endKeyframe.id].preparedEndPoints;
    if (!preparedStartPoints || !preparedEndPoints) {
        [preparedStartPoints, preparedEndPoints] = prepare(
            startKeyframe.initialPoints,
            endKeyframe.initialPoints,
            {rawAngles: false, divideRatio: 1},
        );
        renderCache[startKeyframe.id].preparedStartPoints = preparedStartPoints;
        renderCache[endKeyframe.id].preparedEndPoints = preparedEndPoints;
    }

    // Calculate progress between frames as a fraction.
    const progress =
        (input.timestamp - startKeyframe.timestamp) /
        (endKeyframe.timestamp - startKeyframe.timestamp);

    // Apply timing function of end frame.
    const adjustedProgress = endKeyframe.timingFunction(progress);

    return {
        renderCache,
        lastFrameId: startKeyframe.id,
        points: interpolateBetween(adjustedProgress, preparedStartPoints, preparedEndPoints),
    };
};

// TODO generate internal frames. Delayed frames can just copy the previous one.
// TODO store current blob when interrupts happen to use as source.
// TODO don't remove any frames.
export const transitionFrames = (input: TransitionInput): TransitionOutput => {
    const {renderCache, timestamp, newFrames} = input;

    // Wipe animation when given no keyframes.
    if (input.newFrames.length === 0) {
        return {renderCache: input.renderCache, newFrames: []};
    }

    // Add current state as initial frame.
    const currentState = renderFramesAt(input);
    let internalFrames: InternalKeyframe[] = [
        {
            id: genId(),
            initialPoints: currentState.points,
            timestamp: timestamp,
            timingFunction: (p) => p,
            transitionSourceFrameIndex: null,
        },
    ];

    let totalTime = 0;
    for (let i = 0; i < newFrames.length; i++) {
        const keyframe = newFrames[i];
        if (keyframe.delay && i > 0) {
        }
    }

    return {renderCache, newFrames: internalFrames};
};
