import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {statefulAnimationGenerator} from "../internal/animate/state";
import {
    checkBlobOptions,
    checkCanvasOptions,
    checkKeyframeOptions,
    checkPoints,
} from "../internal/check";

export {WiggleOptions, wigglePreset} from "./wiggle";

interface Keyframe {
    // Duration of the keyframe animation in milliseconds.
    duration: number;
    // Delay before animation begins in milliseconds.
    // Default: 0.
    delay?: number;
    // Controls the speed of the animation over time.
    // Default: "linear".
    timingFunction?:
        | "linear"
        | "easeEnd"
        | "easeStart"
        | "ease"
        | "elasticEnd0"
        | "elasticEnd1"
        | "elasticEnd2"
        | "elasticEnd3";
    // Called after keyframe end-state is reached or passed.
    // Called exactly once when the keyframe end-state is rendered.
    // Not called if the keyframe is preempted by a new transition.
    callback?: () => void;
    // Standard options, refer to "blobs/v2" documentation.
    canvasOptions?: {
        offsetX?: number;
        offsetY?: number;
    };
}

export interface CanvasKeyframe extends Keyframe {
    // Standard options, refer to "blobs/v2" documentation.
    blobOptions: {
        seed: number | string;
        randomness: number;
        extraPoints: number;
        size: number;
    };
}

export interface CanvasCustomKeyframe extends Keyframe {
    // List of point coordinates that produce a single, closed shape.
    points: Point[];
}

export interface Animation {
    // Renders the current state of the animation.
    renderFrame: () => Path2D;
    // Immediately begin animating through the given keyframes.
    // Non-rendered keyframes from previous transitions are cancelled.
    transition: (...keyframes: (CanvasKeyframe | CanvasCustomKeyframe)[]) => void;
    // Resume a paused animation. Has no effect if already playing.
    play: () => void;
    // Pause a playing animation. Has no effect if already paused.
    pause: () => void;
    // Toggle between playing and pausing the animation.
    playPause: () => void;
}

// Function that returns the current timestamp. This value will be used for all
// duration/delay values and will be used to interpolate between keyframes. It
// must produce values increasing in size.
// Default: `Date.now`.
export interface TimestampProvider {
    (): number;
}

const canvasPointGenerator = (keyframe: CanvasKeyframe | CanvasCustomKeyframe): Point[] => {
    let points: Point[];
    if ("points" in keyframe) {
        points = keyframe.points;
    } else {
        points = genFromOptions(keyframe.blobOptions);
    }
    return mapPoints(points, ({curr}) => {
        curr.x += keyframe?.canvasOptions?.offsetX || 0;
        curr.y += keyframe?.canvasOptions?.offsetY || 0;
        return curr;
    });
};

const canvasKeyframeChecker = (keyframe: CanvasKeyframe | CanvasCustomKeyframe, index: number) => {
    try {
        if ("points" in keyframe) return checkPoints(keyframe.points);
        checkBlobOptions(keyframe.blobOptions);
        checkCanvasOptions(keyframe.canvasOptions);
        checkKeyframeOptions(keyframe);
    } catch (e) {
        throw `(blobs2): keyframe ${index}: ${e}`;
    }
};

export const canvasPath = (timestampProvider?: () => number): Animation => {
    let actualTimestampProvider = Date.now;

    // Make sure timestamps are always increasing.
    if (timestampProvider !== undefined) {
        let lastTimestamp = 0;
        actualTimestampProvider = () => {
            const currentTimestamp = timestampProvider();
            if (currentTimestamp < lastTimestamp) {
                throw `timestamp provider generated decreasing value: ${lastTimestamp} then ${currentTimestamp}.`;
            }
            lastTimestamp = currentTimestamp;
            return currentTimestamp;
        };
    }

    return statefulAnimationGenerator(
        canvasPointGenerator,
        renderPath2D,
        canvasKeyframeChecker,
    )(actualTimestampProvider);
};
