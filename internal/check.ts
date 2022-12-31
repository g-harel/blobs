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

export const checkSvgOptions = (svgOptions: any) => {
    typeCheck(`svgOptions`, svgOptions, ["object", "undefined"]);
    if (svgOptions) {
        const {fill, stroke, strokeWidth} = svgOptions;
        typeCheck(`svgOptions.fill`, fill, ["string", "undefined"]);
        typeCheck(`svgOptions.stroke`, stroke, ["string", "undefined"]);
        typeCheck(`svgOptions.strokeWidth`, strokeWidth, ["number", "undefined"]);
    }
};

export const checkPoints = (points: any) => {
    if (!Array.isArray(points)) {
        throw `points should be an array but was "${typeof points}".`;
    }
    if (points.length < 3) {
        throw `expected more than two points but received "${points.length}".`;
    }
    for (const point of points) {
        typeCheck(`point.x`, point.x, ["number"]);
        typeCheck(`point.y`, point.y, ["number"]);
        typeCheck(`point.handleIn`, point.handleIn, ["object"]);
        typeCheck(`point.handleIn.angle`, point.handleIn.angle, ["number"]);
        typeCheck(`point.handleIn.length`, point.handleIn.length, ["number"]);
        typeCheck(`point.handleOut`, point.handleOut, ["object"]);
        typeCheck(`point.handleOut.angle`, point.handleOut.angle, ["number"]);
        typeCheck(`point.handleOut.length`, point.handleOut.length, ["number"]);
    }
};
