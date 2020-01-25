import {copyPoint, length, reverse, shift, split} from "./util";
import {Point, Shape} from "../types";
import {distance} from "../math/geometry";

const optimizeOrder = (a: Shape, b: Shape): Shape => {
    const count = a.length;

    let minSum = Infinity;
    let minOffset = 0;
    let minShape: Shape = [];

    const setMinOffset = (shape: Shape) => {
        for (let i = 0; i < count; i++) {
            let sum = 0;
            for (let j = 0; j < count; j++) {
                sum += distance(a[j], shape[(j + i) % count]);
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
        lengths.push(length(points[i], points[(i + 1) % points.length]));
    }

    const divisors = divideLengths(lengths, count - points.length);
    const out: Shape = [];
    for (let i = 0; i < points.length; i++) {
        const curr: Point = out[out.length - 1] || points[i];
        const next = points[(i + 1) % points.length];
        out.pop();
        out.push(...splitCurveBy(divisors[i], curr, next));
    }
    const last = out.pop();
    out[0].handleIn = last!.handleIn;

    return out;
};

const fixAngles = (a: Shape, b: Shape): Shape => {
    // TODO fix in first shape too
    const out: Shape = [];
    for (let i = 0; i < a.length; i++) {
        const point = copyPoint(b[i]);
        if (point.handleIn.length === 0) {
            point.handleIn.angle = a[i].handleIn.angle;
        }
        if (point.handleOut.length === 0) {
            point.handleOut.angle = a[i].handleOut.angle;
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

export const splitCurveBy = (count: number, a: Point, b: Point): Shape => {
    if (count < 2) return [a, b];
    const percentage = 1 / count;
    const [c, d, e] = split(percentage, a, b);
    if (count === 2) return [c, d, e];
    return [c, ...splitCurveBy(count - 1, d, e)];
};

export const prepShapes = (a: Shape, b: Shape): [Shape, Shape] => {
    const points = Math.max(a.length, b.length);
    const aNorm = divideShape(points, a);
    const bNorm = divideShape(points, b);
    const bOpt = optimizeOrder(aNorm, bNorm);
    const bFix = fixAngles(aNorm, bOpt);
    return [aNorm, bFix];
};
