import {TimingFunc} from "./timing";
import {Point} from "../types";
import {prepare} from "./prepare";
import {interpolateBetween} from "./interpolate";

export interface InternalKeyframe {
    timestamp: number;
    timingFunction: TimingFunc;
    cancelTimeouts: () => void;
    initialPoints: Point[];
    preparedBeforePoints?: Point[];
    preparedAfterPoints?: Point[];
}

export const removeStale = (
    keyframes: InternalKeyframe[],
    timestamp: number,
): InternalKeyframe[] => {
    if (keyframes.length <= 1) return keyframes;
    const staleCount = keyframes.filter((k) => k.timestamp < timestamp).length;
    // Keep a single stale frame for the current transition.
    return keyframes.slice(staleCount - 1);
};

export const cancelTimeouts = (keyframes: InternalKeyframe[]) => {
    for (const frame of keyframes) {
        // Cancelling an already executed timeout is a noop.
        frame.cancelTimeouts();
    }
};

// TODO cache prepared points? Ideally without modifying keyframes argument.
export const renderAt = (keyframes: InternalKeyframe[], timestamp: number): Point[] => {
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
