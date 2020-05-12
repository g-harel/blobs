import {Point} from "../internal/types";
import {renderPath2D} from "../internal/render/canvas";
import {genFromOptions} from "../internal/gen";
import {mapPoints} from "../internal/util";
import {statefulAnimationGenerator} from "../internal/animate/state";
import {typeCheck, err} from "../internal/errors";
import {timingFunctions} from "../internal/animate/timing";

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

// TODO make reusable.
const canvasKeyframeChecker = (keyframe: CanvasKeyframe, index: number) => {
    // keyframe options
    typeCheck(`keyframes[${index}]`, keyframe, ["object"]);
    const {delay, duration, timingFunction, callback} = keyframe;
    typeCheck(`keyframes[${index}].delay`, delay, ["number", "undefined"]);
    if (delay && delay < 0) err(`keyframes[${index}].delay is invalid "${delay}".`);
    typeCheck(`keyframes[${index}].duration`, duration, ["number"]);
    if (duration && duration < 0) err(`keyframes[${index}].duration is invalid "${duration}".`);
    typeCheck(`keyframes[${index}].timingFunction`, timingFunction, ["string", "undefined"]);
    if (timingFunction && !timingFunctions[timingFunction])
        err(`"keyframes[${index}].timingFunction" is not recognized "${timingFunction}".`);
    typeCheck(`keyframes[${index}].callback`, callback, ["function", "undefined"]);

    // blobOptions
    typeCheck(`keyframes[${index}].blobOptions`, keyframe.blobOptions, ["object"]);
    const {seed, extraPoints, randomness, size} = keyframe.blobOptions;
    typeCheck(`keyframes[${index}].blobOptions.seed`, seed, ["string", "number"]);
    typeCheck(`keyframes[${index}].blobOptions.extraPoints`, extraPoints, ["number"]);
    if (extraPoints < 0)
        err(`keyframes[${index}].blobOptions.extraPoints is invalid "${extraPoints}".`);
    typeCheck(`keyframes[${index}].blobOptions.randomness`, randomness, ["number"]);
    if (randomness < 0)
        err(`keyframes[${index}].blobOptions.randomness is invalid "${randomness}".`);
    typeCheck(`keyframes[${index}].blobOptions.size`, size, ["number"]);
    if (size < 0) err(`keyframes[${index}].blobOptions.size is invalid "${size}".`);

    // canvasOptions
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
