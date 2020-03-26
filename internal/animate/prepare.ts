import {
    length,
    reverse,
    shift,
    insertCount,
    distance,
    mod,
    angleOf,
    coordEqual,
    mapPoints,
    forPoints,
} from "../util";
import {Point} from "../types";

// TODO OPT extract optimization logic
const optimizeOrder = (a: Point[], b: Point[]): Point[] => {
    const count = a.length;

    let minSum = Infinity;
    let minOffset = 0;
    let minOffsetBase: Point[] = [];

    const setMinOffset = (points: Point[]) => {
        for (let i = 0; i < count; i++) {
            let sum = 0;
            for (let j = 0; j < count; j++) {
                sum += (100 * distance(a[j], points[mod(j + i, count)])) ** 1 / 2;
                if (sum > minSum) break;
            }
            if (sum <= minSum) {
                minSum = sum;
                minOffset = i;
                minOffsetBase = points;
            }
        }
    };
    setMinOffset(b);
    setMinOffset(reverse(b));

    return shift(minOffset, minOffsetBase);
};

// TODO OPT allow extra division
export const divide = (count: number, points: Point[]): Point[] => {
    if (points.length < 3) throw new Error("not enough points");
    if (count < points.length) throw new Error("cannot remove points");
    if (count === points.length) return points.slice();

    const lengths: number[] = [];
    forPoints(points, ({curr, next}) => {
        lengths.push(length(curr, next()));
    });

    const divisors = divideLengths(lengths, count - points.length);
    const out: Point[] = [];
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

// TODO OPT disable
const fixAnglesWith = (fixee: Point[], fixer: Point[]): Point[] => {
    return mapPoints(fixee, ({index, curr, prev, next}) => {
        if (curr.handleIn.length === 0 && coordEqual(prev(), curr)) {
            curr.handleIn.angle = fixer[index].handleIn.angle;
        }
        if (curr.handleOut.length === 0 && coordEqual(next(), curr)) {
            curr.handleOut.angle = fixer[index].handleOut.angle;
        }
        return curr;
    });
};

// TODO OPT disable
const fixAnglesSelf = (points: Point[]): Point[] => {
    return mapPoints(points, ({curr, prev, next}) => {
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

export const prepare = (a: Point[], b: Point[]): [Point[], Point[]] => {
    const pointCount = Math.max(a.length, b.length);
    const aNorm = divide(pointCount, a);
    const bNorm = divide(pointCount, b);
    const bOpt = optimizeOrder(aNorm, bNorm);
    return [fixAnglesWith(fixAnglesSelf(aNorm), bNorm), fixAnglesWith(fixAnglesSelf(bOpt), aNorm)];
};
