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
}

export interface RenderCache {
    [frameId: string]: {
        preparedEndPoints?: Point[];
        preparedStartPoints?: Point[];
    };
}

export interface RenderInput {
    keyframes: InternalKeyframe[];
    timestamp: number;
    cache: RenderCache;
}

export interface RenderOutput {
    points: Point[];
    lastFrameId: string | null;
    cache: RenderCache;
}

export interface TransitionInput extends RenderInput {
    newFrames: Keyframe[];
}

export interface TransitionOutput {
    frames: InternalKeyframe[];
    cache: RenderCache;
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

export const renderFramesAt = (input: RenderInput): RenderOutput => {
    const {cache, keyframes} = input;

    if (keyframes.length === 0) {
        return {cache, lastFrameId: null, points: []};
    }

    // Animation freezes at the final shape if there are no more keyframes.
    if (keyframes.length === 1) {
        const first = keyframes[0];
        return {cache, lastFrameId: first.id, points: first.initialPoints};
    }

    // Find the start/end keyframes according to the timestamp.
    let startKeyframe = keyframes[0];
    let endKeyframe = keyframes[1];
    for (let i = 2; i < keyframes.length; i++) {
        if (endKeyframe.timestamp < input.timestamp) break;
        startKeyframe = keyframes[i - 1];
        endKeyframe = keyframes[i];
    }

    // Use and cache prepared points for current interpolation.
    let preparedStartPoints: Point[] | undefined = cache[startKeyframe.id].preparedStartPoints;
    let preparedEndPoints: Point[] | undefined = cache[endKeyframe.id].preparedEndPoints;
    if (!preparedStartPoints || !preparedEndPoints) {
        [preparedStartPoints, preparedEndPoints] = prepare(
            startKeyframe.initialPoints,
            endKeyframe.initialPoints,
            {rawAngles: false, divideRatio: 1},
        );
        cache[startKeyframe.id].preparedStartPoints = preparedStartPoints;
        cache[endKeyframe.id].preparedEndPoints = preparedEndPoints;
    }

    // Calculate progress between frames as a fraction.
    const progress =
        (input.timestamp - startKeyframe.timestamp) /
        (endKeyframe.timestamp - startKeyframe.timestamp);

    // Apply timing function of end frame.
    const adjustedProgress = endKeyframe.timingFunction(progress);

    // TODO use timing function.
    return {
        cache,
        lastFrameId: startKeyframe.id,
        points: interpolateBetween(adjustedProgress, preparedStartPoints, preparedEndPoints),
    }
};

// TODO generate internal frames. Delayed frames can just copy the previous one.
// TODO store current blob when interrupts happen to use as source.
// TODO don't remove any frames.
export const transitionFrames = (input: TransitionInput): TransitionOutput => {
    const {cache, timestamp, newFrames} = input;

    // Add current state as initial frame.
    const currentState = renderFramesAt(input);
    let internalFrames: InternalKeyframe[] = [
        {
            id: genId(),
            initialPoints: currentState.points,
            timestamp: timestamp,
            timingFunction: (p) => p,
        },
    ];

    let totalTime = 0;
    for (let i = 0; i < newFrames.length; i++) {
        const keyframe = newFrames[i];
        if (keyframe.delay && i > 0) {
        }
    }

    return {cache, frames: internalFrames};
};
