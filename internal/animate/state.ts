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
    preparedBeforePoints?: Point[];
    preparedAfterPoints?: Point[];
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

// TODO cache prepared points? Ideally without modifying keyframes argument.
export const renderFramesAt = (keyframes: InternalKeyframe[], timestamp: number): Point[] => {
    if (keyframes.length === 0) return [];

    // Animation freezes at the final shape if there are no more keyframes.
    if (keyframes.length === 1) return keyframes[0].initialPoints;

    // Find the start/end keyframes according to the timestamp.
    let startKeyframe = keyframes[0];
    let endKeyframe = keyframes[1];
    for (let i = 2; i < keyframes.length; i++) {
        if (endKeyframe.timestamp < timestamp) break;
        startKeyframe = keyframes[i - 1];
        endKeyframe = keyframes[i];
    }

    // Use and cache prepared points for current interpolation.
    let preparedStartPoints: Point[] | undefined = startKeyframe.preparedAfterPoints;
    let preparedEndPoints: Point[] | undefined = endKeyframe.preparedBeforePoints;
    if (!preparedStartPoints || !preparedEndPoints) {
        [preparedStartPoints, preparedEndPoints] = prepare(
            startKeyframe.initialPoints,
            endKeyframe.initialPoints,
            {rawAngles: false, divideRatio: 1},
        );
    }

    // Calculate progress between frames as a fraction.
    const progress =
        (timestamp - startKeyframe.timestamp) / (endKeyframe.timestamp - startKeyframe.timestamp);

    // Apply timing function of end frame.
    const adjustedProgress = endKeyframe.timingFunction(progress);

    // TODO use timing function.
    return interpolateBetween(adjustedProgress, preparedStartPoints, preparedEndPoints);
};

// TODO generate internal frames. Delayed frames can just copy the previous one.
// TODO store current blob when interrupts happen to use as source.
// TODO don't remove any frames.
export const transitionFrames = (
    currentFrames: InternalKeyframe[],
    newFrames: Keyframe[],
    timestamp: number,
): InternalKeyframe[] => {
    let totalTime = 0;

    // Add current state as initial frame.
    let internalFrames: InternalKeyframe[] = [
        {
            id: genId(),
            initialPoints: renderFramesAt(currentFrames, timestamp),
            timestamp: timestamp,
            timingFunction: (p) => p,
        },
    ];
    for (let i = 0; i < newFrames.length; i++) {
        const keyframe = newFrames[i];
        if (keyframe.delay && i > 0) {
        }
    }

    return [];
};
