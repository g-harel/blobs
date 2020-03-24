import {
    length,
    reverse,
    shift,
    insertCount,
    distance,
    mod,
    angleOf,
    coordEqual,
    mapShape,
    forShape,
} from "../util";
import {Point, Shape} from "../types";

// OPT extract optimization logic
const optimizeOrder = (a: Shape, b: Shape): Shape => {
    const count = a.length;

    let minSum = Infinity;
    let minOffset = 0;
    let minShape: Shape = [];

    const setMinOffset = (shape: Shape) => {
        for (let i = 0; i < count; i++) {
            let sum = 0;
            for (let j = 0; j < count; j++) {
                sum += (100 * distance(a[j], shape[mod(j + i, count)])) ** 1 / 2;
                if (sum > minSum) break;
            }
            if (sum <= minSum) {
                minSum = sum;
                minOffset = i;
                minShape = shape;
            }
        }
    };
    setMinOffset(b);
    setMinOffset(reverse(b));

    return shift(minOffset, minShape);
};

// OPT allow extra division
export const divideShape = (count: number, shape: Shape): Shape => {
    if (shape.length < 3) throw new Error("not enough points");
    if (count < shape.length) throw new Error("cannot remove points");
    if (count === shape.length) return shape.slice();

    const lengths: number[] = [];
    forShape(shape, ({curr, next}) => {
        lengths.push(length(curr, next()));
    });

    const divisors = divideLengths(lengths, count - shape.length);
    const out: Shape = [];
    for (let i = 0; i < shape.length; i++) {
        const curr: Point = out[out.length - 1] || shape[i];
        const next = shape[mod(i + 1, shape.length)];
        out.pop();
        out.push(...insertCount(divisors[i], curr, next));
    }
    const last = out.pop();
    out[0].handleIn = last!.handleIn;

    return out;
};

// OPT disable
const fixAnglesWith = (fixee: Shape, fixer: Shape): Shape => {
    return mapShape(fixee, ({index, curr, prev, next}) => {
        if (curr.handleIn.length === 0 && coordEqual(prev(), curr)) {
            curr.handleIn.angle = fixer[index].handleIn.angle;
        }
        if (curr.handleOut.length === 0 && coordEqual(next(), curr)) {
            curr.handleOut.angle = fixer[index].handleOut.angle;
        }
        return curr;
    });
};

// OPT disable
const fixAnglesSelf = (shape: Shape): Shape => {
    return mapShape(shape, ({curr, prev, next}) => {
        const angle = angleOf(prev(), next());
        if (curr.handleIn.length === 0) {
            curr.handleIn.angle = angle + Math.PI;
        }
        if (curr.handleOut.length === 0) {
            curr.handleOut.angle = angle;
        }
        return curr;
    });
};

const divideLengths = (lengths: number[], add: number): number[] => {
    const divisors = lengths.map(() => 1);
    const sizes = lengths.slice();
    for (let i = 0; i < add; i++) {
        let maxSizeIndex = 0;
        for (let j = 1; j < sizes.length; j++) {
            if (sizes[j] > sizes[maxSizeIndex]) {
                maxSizeIndex = j;
                continue;
            }
            if (sizes[j] === sizes[maxSizeIndex]) {
                if (lengths[j] > lengths[maxSizeIndex]) {
                    maxSizeIndex = j;
                }
            }
        }
        divisors[maxSizeIndex]++;
        sizes[maxSizeIndex] = lengths[maxSizeIndex] / divisors[maxSizeIndex];
    }
    return divisors;
};

export const prepShapes = (a: Shape, b: Shape): [Shape, Shape] => {
    const pointCount = Math.max(a.length, b.length);
    const aNorm = divideShape(pointCount, a);
    const bNorm = divideShape(pointCount, b);
    const bOpt = optimizeOrder(aNorm, bNorm);
    return [fixAnglesWith(fixAnglesSelf(aNorm), bNorm), fixAnglesWith(fixAnglesSelf(bOpt), aNorm)];
};
