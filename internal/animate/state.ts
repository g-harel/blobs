import {TimingFunc, timingFunctions} from "./timing";
import {Point} from "../types";
import {prepare} from "./prepare";
import {interpolateBetween} from "./interpolate";

export interface Keyframe {
    delay?: number;
    duration: number;
    timingFunction?: keyof typeof timingFunctions;
}

export interface InternalKeyframe {
    id: string;
    timestamp: number;
    timingFunction: TimingFunc;
    initialPoints: Point[];
    transitionSourceFrameIndex: number;
    isSynthetic: boolean;
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

export interface TransitionInput<T extends Keyframe> extends RenderInput {
    newFrames: T[];
    shapeGenerator:(keyframe: T) => Point[],
}

export interface TransitionOutput {
    newFrames: InternalKeyframe[];
}

const genId = (): string => {
    return String(Math.random()).substr(2);
};

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
// TODO store current shape when interrupts happen to use as source.
// TODO defend against "bad" keyframes like negative timing.
// TODO copy keyframes as soon as possible to make sure they aren't modified afterwards.
export const transitionFrames = <T extends Keyframe>(input: TransitionInput<T>): TransitionOutput => {
    const {timestamp, newFrames} = input;

    // Wipe animation when given no keyframes.
    if (input.newFrames.length === 0) {
        return {newFrames: []};
    }

    // Add current state as initial frame.
    const currentState = renderFramesAt(input);
    let internalFrames: InternalKeyframe[] = [
        {
            id: genId(),
            initialPoints: currentState.points,
            timestamp: timestamp,
            timingFunction: (p) => p,
            transitionSourceFrameIndex: -1,
            isSynthetic: true,
        },
    ];

    let totalTime = 0;
    for (let i = 0; i < newFrames.length; i++) {
        const keyframe = newFrames[i];
        if (keyframe.delay && i > 0) {
        }
    }

    return {newFrames: internalFrames};
};
