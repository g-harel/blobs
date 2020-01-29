import {
    copyPoint,
    length,
    reverse,
    shift,
    insertCount,
    distance,
    mod,
    angleOf,
    coordEqual,
} from "../util";
import {Point, Shape} from "../types";

const optimizeOrder = (a: Shape, b: Shape): Shape => {
    const count = a.length;

    let minSum = Infinity;
    let minOffset = 0;
    let minShape: Shape = [];

    const setMinOffset = (shape: Shape) => {
        for (let i = 0; i < count; i++) {
            let sum = 0;
            for (let j = 0; j < count; j++) {
                sum += distance(a[j], shape[mod(j + i, count)]);
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

export const divideShape = (count: number, points: Shape): Shape => {
    if (points.length < 3) throw new Error("not enough points");
    if (count < points.length) throw new Error("cannot remove points");
    if (count === points.length) return points.slice();

    const lengths = [];
    for (let i = 0; i < points.length; i++) {
        lengths.push(length(points[i], points[mod(i + 1, points.length)]));
    }

    const divisors = divideLengths(lengths, count - points.length);
    const out: Shape = [];
    for (let i = 0; i < points.length; i++) {
        const curr: Point = out[out.length - 1] || points[i];
        const next = points[mod(i + 1, points.length)];
        out.pop();
        out.push(...insertCount(divisors[i], curr, next));
    }
    const last = out.pop();
    out[0].handleIn = last!.handleIn;

    return out;
};

const fixAnglesWith = (fixee: Shape, fixer: Shape): Shape => {
    const out: Shape = [];
    for (let i = 0; i < fixee.length; i++) {
        const before = fixee[mod(i - 1, fixee.length)];
        const after = fixee[mod(i + 1, fixee.length)];
        const point = copyPoint(fixee[i]);
        if (point.handleIn.length === 0 && coordEqual(before, point)) {
            point.handleIn.angle = fixer[i].handleIn.angle;
        }
        if (point.handleOut.length === 0 && coordEqual(after, point)) {
            point.handleOut.angle = fixer[i].handleOut.angle;
        }
        out.push(point);
    }
    return out;
};

const fixAnglesSelf = (shape: Shape): Shape => {
    const out: Shape = [];
    for (let i = 0; i < shape.length; i++) {
        const before = shape[mod(i - 1, shape.length)];
        const after = shape[mod(i + 1, shape.length)];
        const angle = angleOf(before, after);
        const point = copyPoint(shape[i]);
        if (point.handleIn.length === 0) {
            point.handleIn.angle = angle + Math.PI;
        }
        if (point.handleOut.length === 0) {
            point.handleOut.angle = angle;
        }
        out.push(point);
    }
    return out;
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
    const points = Math.max(a.length, b.length);
    const aNorm = divideShape(points, a);
    const bNorm = divideShape(points, b);
    const bOpt = optimizeOrder(aNorm, bNorm);
    return [fixAnglesWith(fixAnglesSelf(aNorm), bNorm), fixAnglesWith(fixAnglesSelf(bOpt), aNorm)];
};
