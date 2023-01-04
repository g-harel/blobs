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

    // Synthetic keyframes are generated to represent the current state when
    // a new transition is begun.
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
    shapeGenerator: (keyframe: T) => Point[];
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
        if (endKeyframe.timestamp > input.timestamp) break;
        startKeyframe = currentFrames[i - 1];
        endKeyframe = currentFrames[i];
    }

    // Return original end shape when past the end of the animation.
    const endKeyframeIsLast = endKeyframe === currentFrames[currentFrames.length - 1];
    const animationIsPastEndKeyframe = endKeyframe.timestamp < input.timestamp;
    if (animationIsPastEndKeyframe && endKeyframeIsLast) {
        return {
            renderCache,
            lastFrameId: endKeyframe.id,
            points: endKeyframe.initialPoints,
        };
    }

    // Use and cache prepared points for current interpolation.
    let preparedStartPoints: Point[] | undefined =
        renderCache[startKeyframe.id]?.preparedStartPoints;
    let preparedEndPoints: Point[] | undefined = renderCache[endKeyframe.id]?.preparedEndPoints;
    if (!preparedStartPoints || !preparedEndPoints) {
        [preparedStartPoints, preparedEndPoints] = prepare(
            startKeyframe.initialPoints,
            endKeyframe.initialPoints,
            {rawAngles: false, divideRatio: 1},
        );

        renderCache[startKeyframe.id] = renderCache[startKeyframe.id] || {};
        renderCache[startKeyframe.id].preparedStartPoints = preparedStartPoints;

        renderCache[endKeyframe.id] = renderCache[endKeyframe.id] || {};
        renderCache[endKeyframe.id].preparedEndPoints = preparedEndPoints;
    }

    // Calculate progress between frames as a fraction.
    const progress =
        (input.timestamp - startKeyframe.timestamp) /
        (endKeyframe.timestamp - startKeyframe.timestamp);

    // Keep progress within expected range (ex. division by 0).
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Apply timing function of end frame.
    const adjustedProgress = endKeyframe.timingFunction(clampedProgress);

    return {
        renderCache,
        lastFrameId: clampedProgress === 1 ? endKeyframe.id : startKeyframe.id,
        points: interpolateBetween(adjustedProgress, preparedStartPoints, preparedEndPoints),
    };
};

export const transitionFrames = <T extends Keyframe>(
    input: TransitionInput<T>,
): TransitionOutput => {
    // Erase all old frames.
    const newInternalFrames: InternalKeyframe[] = [];

    // Reset animation when given no keyframes.
    if (input.newFrames.length === 0) {
        return {newFrames: newInternalFrames};
    }

    // Add current state as initial frame.
    const currentState = renderFramesAt(input);
    if (currentState.lastFrameId === null) {
        // If there is currently no shape being rendered, use a point in the
        // center of the next frame as the initial point.
        const firstShape = input.shapeGenerator(input.newFrames[0]);
        let firstShapeCenterPoint: Point = {
            x: 0,
            y: 0,
            handleIn: {angle: 0, length: 0},
            handleOut: {angle: 0, length: 0},
        };
        for (const point of firstShape) {
            firstShapeCenterPoint.x += point.x / firstShape.length;
            firstShapeCenterPoint.y += point.y / firstShape.length;
        }
        currentState.points = [firstShapeCenterPoint, firstShapeCenterPoint, firstShapeCenterPoint];
    }
    newInternalFrames.push({
        id: genId(),
        initialPoints: currentState.points,
        timestamp: input.timestamp,
        timingFunction: timingFunctions.linear,
        transitionSourceFrameIndex: -1,
        isSynthetic: true,
    });

    // Generate and add new frames.
    let totalOffset = 0;
    for (let i = 0; i < input.newFrames.length; i++) {
        const keyframe = input.newFrames[i];

        // Copy previous frame when current one has a delay.
        if (keyframe.delay) {
            totalOffset += keyframe.delay;
            const prevFrame = newInternalFrames[newInternalFrames.length - 1];
            newInternalFrames.push({
                id: genId(),
                initialPoints: prevFrame.initialPoints,
                timestamp: input.timestamp + totalOffset,
                timingFunction: timingFunctions.linear,
                transitionSourceFrameIndex: i - 1,
                isSynthetic: true,
            });
        }

        totalOffset += keyframe.duration;
        newInternalFrames.push({
            id: genId(),
            initialPoints: input.shapeGenerator(keyframe),
            timestamp: input.timestamp + totalOffset,
            timingFunction: timingFunctions[keyframe.timingFunction || "linear"],
            transitionSourceFrameIndex: i,
            isSynthetic: false,
        });
    }

    return {newFrames: newInternalFrames};
};
