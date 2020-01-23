import {Coord, Handle, Point} from "./types";
import {distance, expandHandle, splitLine} from "./util";

const copyPoint = (p: Point): Point => ({
    x: p.x,
    y: p.y,
    handleIn: {...p.handleIn},
    handleOut: {...p.handleOut},
});

const collapseHandle = (origin: Coord, handle: Coord): Handle => {
    const dx = handle.x - origin.x;
    const dy = -handle.y + origin.y;
    let angle = Math.atan2(dy, dx);
    return {
        angle: angle < 0 ? Math.abs(angle) : 2 * Math.PI - angle,
        length: Math.sqrt(dx ** 2 + dy ** 2),
    };
};

export const approxCurveLength = (a: Point, b: Point): number => {
    const aHandle = expandHandle(a, a.handleOut);
    const bHandle = expandHandle(b, b.handleIn);
    const ab = distance(a, b);
    const abHandle = distance(aHandle, bHandle);
    return (ab + abHandle + a.handleOut.length + b.handleIn.length) / 2;
};

const invertShape = (shape: Point[]): Point[] => {
    const inverted: Point[] = [];
    for (let i = 0; i < shape.length; i++) {
        const j = shape.length - i - 1;
        const p = copyPoint(shape[j]);
        p.handleIn.angle += Math.PI;
        p.handleOut.angle += Math.PI;
        inverted.push(p);
    }
    return inverted;
};

const optimizeOrder = (a: Point[], b: Point[]): Point[] => {
    const count = a.length;

    let minSum = Infinity;
    let minOffset = 0;
    let minShape: Point[] = [];

    const setMinOffset = (shape: Point[]) => {
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
    setMinOffset(invertShape(b));

    return offsetShape(minOffset, minShape);
};

const offsetShape = (offset: number, shape: Point[]): Point[] => {
    if (offset === 0) return shape;
    const out: Point[] = [];
    for (let i = 0; i < shape.length; i++) {
        out.push(shape[(i + offset) % shape.length]);
    }
    return out;
};

export const divideShape = (count: number, points: Point[]): Point[] => {
    if (points.length < 3) throw new Error("not enough points");
    if (count < points.length) throw new Error("cannot remove points");
    if (count === points.length) return points.slice();

    const lengths = [];
    for (let i = 0; i < points.length; i++) {
        lengths.push(approxCurveLength(points[i], points[(i + 1) % points.length]));
    }

    const divisors = divideLengths(lengths, count - points.length);
    const out: Point[] = [];
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

const fixAngles = (a: Point[], b: Point[]): Point[] => {
    const out: Point[] = [];
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

export const splitCurveBy = (count: number, a: Point, b: Point): Point[] => {
    if (count < 2) return [a, b];
    const percentage = 1 / count;
    const [c, d, e] = splitCurveAt(percentage, a, b);
    if (count === 2) return [c, d, e];
    return [c, ...splitCurveBy(count - 1, d, e)];
};

// Add a control point to the curve between a and b.
// Percentage [0, 1] from a to b.
// a: original first point.
// b: original last point.
// c: new first point.
// d: new added point.
// e: new last point.
// f: split point between a and b's handles.
// g: split point between c's handle and f.
// h: split point between e's handle and f.
export const splitCurveAt = (percentage: number, a: Point, b: Point): [Point, Point, Point] => {
    const c = copyPoint(a);
    c.handleOut.length *= percentage;

    const e = copyPoint(b);
    e.handleIn.length *= 1 - percentage;

    const aHandle = expandHandle(a, a.handleOut);
    const bHandle = expandHandle(b, b.handleIn);
    const cHandle = expandHandle(c, c.handleOut);
    const eHandle = expandHandle(e, e.handleIn);
    const f = splitLine(percentage, aHandle, bHandle);
    const g = splitLine(percentage, cHandle, f);
    const h = splitLine(1 - percentage, eHandle, f);
    const dCoord = splitLine(percentage, g, h);

    const d: Point = {
        x: dCoord.x,
        y: dCoord.y,
        handleIn: collapseHandle(dCoord, g),
        handleOut: collapseHandle(dCoord, h),
    };
    return [c, d, e];
};

export const prepShapes = (a: Point[], b: Point[]): [Point[], Point[]] => {
    const points = Math.max(a.length, b.length);
    const aNorm = divideShape(points, a);
    const bNorm = divideShape(points, b);
    const bOpt = optimizeOrder(aNorm, bNorm);
    const bFix = fixAngles(aNorm, bOpt);
    return [aNorm, bFix];
};
