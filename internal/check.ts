import {timingFunctions} from "./animate/timing";

const typeCheck = (name: string, val: any, expected: string[]) => {
    let actual: string = typeof val;
    if (actual === "number" && isNaN(val)) actual = "NaN";
    if (actual === "object" && val === null) actual = "null";
    if (!expected.includes(actual)) {
        throw `"${name}" should have type "${expected.join("|")}" but was "${actual}".`;
    }
};

export const checkKeyframeOptions = (keyframe: any) => {
    typeCheck(`keyframe`, keyframe, ["object"]);
    const {delay, duration, timingFunction, callback} = keyframe;
    typeCheck(`delay`, delay, ["number", "undefined"]);
    if (delay && delay < 0) throw `delay is invalid "${delay}".`;
    typeCheck(`duration`, duration, ["number"]);
    if (duration && duration < 0) throw `duration is invalid "${duration}".`;
    typeCheck(`timingFunction`, timingFunction, ["string", "undefined"]);
    if (timingFunction && !(timingFunctions as any)[timingFunction])
        throw `".timingFunction" is not recognized "${timingFunction}".`;
    typeCheck(`callback`, callback, ["function", "undefined"]);
};

export const checkBlobOptions = (blobOptions: any) => {
    typeCheck(`blobOptions`, blobOptions, ["object"]);
    const {seed, extraPoints, randomness, size} = blobOptions;
    typeCheck(`blobOptions.seed`, seed, ["string", "number"]);
    typeCheck(`blobOptions.extraPoints`, extraPoints, ["number"]);
    if (extraPoints < 0) throw `blobOptions.extraPoints is invalid "${extraPoints}".`;
    typeCheck(`blobOptions.randomness`, randomness, ["number"]);
    if (randomness < 0) throw `blobOptions.randomness is invalid "${randomness}".`;
    typeCheck(`blobOptions.size`, size, ["number"]);
    if (size < 0) throw `blobOptions.size is invalid "${size}".`;
};

export const checkCanvasOptions = (canvasOptions: any) => {
    typeCheck(`canvasOptions`, canvasOptions, ["object", "undefined"]);
    if (canvasOptions) {
        const {offsetX, offsetY} = canvasOptions;
        typeCheck(`canvasOptions.offsetX`, offsetX, ["number", "undefined"]);
        typeCheck(`canvasOptions.offsetY`, offsetY, ["number", "undefined"]);
    }
};
