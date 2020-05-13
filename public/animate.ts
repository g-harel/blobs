import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {statefulAnimationGenerator} from "../internal/animate/state";
import {checkBlobOptions, checkCanvasOptions, checkKeyframeOptions} from "../internal/check";

export interface CanvasKeyframe {
    delay?: number;
    duration: number;
    timingFunction?:
        | "linear"
        | "easeEnd"
        | "easeStart"
        | "ease"
        | "elasticEnd0"
        | "elasticEnd1"
        | "elasticEnd2"
        | "elasticEnd3";
    callback?: () => void;
    blobOptions: {
        seed: number | string;
        randomness: number;
        extraPoints: number;
        size: number;
    };
    canvasOptions?: {
        offsetX?: number;
        offsetY?: number;
    };
}

const canvasBlobGenerator = (keyframe: CanvasKeyframe): Point[] => {
    return mapPoints(genFromOptions(keyframe.blobOptions), ({curr}) => {
        curr.x += keyframe?.canvasOptions?.offsetX || 0;
        curr.y += keyframe?.canvasOptions?.offsetY || 0;
        return curr;
    });
};

const canvasKeyframeChecker = (keyframe: CanvasKeyframe, index: number) => {
    try {
        checkBlobOptions(keyframe.blobOptions);
        checkCanvasOptions(keyframe.canvasOptions);
        checkKeyframeOptions(keyframe);
    } catch (e) {
        throw `(blobs2): keyframe ${index}: ${e}`;
    }
};

export const canvasPath = statefulAnimationGenerator(
    canvasBlobGenerator,
    renderPath2D,
    canvasKeyframeChecker,
);
