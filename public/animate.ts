import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {statefulAnimationGenerator} from "../internal/animate/state";
import {typeCheck} from "../internal/errors";

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

// Only need to check properties unique to the canvas animation generator.
const canvasKeyframeChecker = (keyframe: CanvasKeyframe, index: number) => {
    typeCheck(`keyframes[${index}].canvasOptions`, keyframe.canvasOptions, ["object", "undefined"]);
    if (keyframe.canvasOptions) {
        const {offsetX, offsetY} = keyframe.canvasOptions;
        typeCheck(`keyframes[${index}].canvasOptions.offsetX`, offsetX, ["number", "undefined"]);
        typeCheck(`keyframes[${index}].canvasOptions.offsetY`, offsetY, ["number", "undefined"]);
    }
};

export const canvasPath = statefulAnimationGenerator(
    canvasBlobGenerator,
    renderPath2D,
    canvasKeyframeChecker,
);
