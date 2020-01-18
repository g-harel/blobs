// http://www.cad.zju.edu.cn/home/zhx/papers/PoissonMorphing.pdf
// https://medium.com/@adrian_cooney/bezier-interpolation-13b68563313a
// http://www.iscriptdesign.com/?sketch=tutorial/splitbezier

let ctx: CanvasRenderingContext2D;

const animationSpeed = 2;
const animationStart = 0.3;
const debugBezier = true;
const debugBezierColor = "#8bb";
const debugHandles = true;
const debugHandlesInColor = "#ccc";
const debugHandlesOutColor = "#b6b";
const infoSpacing = 20;
const pointSize = 2;
const size = 1000;

interface Coordinates {
    // Horizontal distance towards the right from the left edge of the canvas.
    x: number;
    // Vertical distance downwards from the top of the canvas.
    y: number;
}

interface Handle {
    // Angle in radians relative to the 3:00 position going clockwise.
    angle: number;
    // Length of the handle.
    length: number;
}

interface Point {
    // Horizontal distance towards the right from the left edge of the canvas.
    x: number;
    // Vertical distance downwards from the top of the canvas.
    y: number;
    // Cubic bezier handles.
    handleIn: Handle;
    handleOut: Handle;
}

interface EasingFunc {
    (progress: number): number;
}

interface Keyframe {
    points: Point[];
    easeIn: EasingFunc;
    easeOut: EasingFunc;
}

const interpolate = (...keyframes: Keyframe[]) => {
    // - Make all have same number of points.
    //   - Add points along path to shape with least points.
    //     - Redistribute points as evenly as possible.
    //   - Keep points at sharp edges.
    //   - Add points to both shapes to make smoother.
    // - Match points using a (customizable?) heuristic.
    //   - Proximity + angle?
    // - Interpolate between both states
    //   - Output using generator?
};

export const rad = (deg: number) => {
    return (deg / 360) * 2 * Math.PI;
};

export const distance = (a: Coordinates, b: Coordinates): number => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const point = (x: number, y: number, ia: number, il: number, oa: number, ol: number): Point => {
    return {
        x: x * size,
        y: y * size,
        handleIn: {angle: rad(ia), length: il * size},
        handleOut: {angle: rad(oa), length: ol * size},
    };
};

const copyPoint = (p: Point): Point => ({
    x: p.x,
    y: p.y,
    handleIn: {...p.handleIn},
    handleOut: {...p.handleOut},
});

const expandHandle = (origin: Coordinates, handle: Handle): Coordinates => {
    return {
        x: origin.x + handle.length * Math.cos(handle.angle),
        y: origin.y + handle.length * Math.sin(handle.angle),
    };
};

const collapseHandle = (origin: Coordinates, handle: Coordinates): Handle => {
    const dx = handle.x - origin.x;
    const dy = -handle.y + origin.y;
    let angle = Math.atan2(dy, dx);
    return {
        angle: angle < 0 ? Math.abs(angle) : 2 * Math.PI - angle,
        length: Math.sqrt(dx ** 2 + dy ** 2),
    };
};

const drawLine = (a: Coordinates, b: Coordinates, style: string) => {
    const backupStrokeStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = style;
    ctx.stroke();
    ctx.strokeStyle = backupStrokeStyle;
};

const drawPoint = (p: Coordinates, style: string) => {
    const backupFillStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pointSize, 0, 2 * Math.PI);
    ctx.fillStyle = style;
    ctx.fill();
    ctx.fillStyle = backupFillStyle;
};

const drawInfo = (() => {
    let count = 1;
    const positions: Record<string, any> = {};
    return (label: string, value: any) => {
        if (!positions[label]) {
            positions[label] = count;
            count++;
        }
        ctx.fillText(`${label}: ${value}`, infoSpacing, positions[label] * infoSpacing);
    };
})();

const splitLine = (percentage: number, a: Coordinates, b: Coordinates): Coordinates => {
    return {
        x: a.x + percentage * (b.x - a.x),
        y: a.y + percentage * (b.y - a.y),
    };
};

const approxCurveLength = (a: Point, b: Point): number => {
    const aHandle = expandHandle(a, a.handleOut);
    const bHandle = expandHandle(b, b.handleIn);
    const ab = distance(a, b);
    const abHandle = distance(aHandle, bHandle);
    return (ab + abHandle + a.handleOut.length + b.handleIn.length) / 2;
};

const divideShape = (count: number, points: Point[]): Point[] => {
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

const splitCurveBy = (count: number, a: Point, b: Point): Point[] => {
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
const splitCurveAt = (percentage: number, a: Point, b: Point): [Point, Point, Point] => {
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
    const dCoordinates = splitLine(percentage, g, h);

    if (debugBezier) {
        drawLine(b, bHandle, debugBezierColor);
        drawLine(a, aHandle, debugBezierColor);
        drawLine(aHandle, bHandle, debugBezierColor);
        drawLine(cHandle, f, debugBezierColor);
        drawLine(eHandle, f, debugBezierColor);
        drawLine(g, h, debugBezierColor);
        if (!debugHandles) {
            drawPoint(dCoordinates, debugBezierColor);
            drawLine(dCoordinates, g, debugBezierColor);
            drawLine(dCoordinates, h, debugBezierColor);
        }
    }

    const d: Point = {
        x: dCoordinates.x,
        y: dCoordinates.y,
        handleIn: collapseHandle(dCoordinates, g),
        handleOut: collapseHandle(dCoordinates, h),
    };
    return [c, d, e];
};

const renderShape = (points: Point[]) => {
    if (points.length < 2) throw new Error("not enough points");

    // Draw points.
    for (let i = 0; i < points.length; i++) {
        // Compute coordinates of handles.
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const currHandle = expandHandle(curr, curr.handleOut);
        const nextHandle = expandHandle(next, next.handleIn);

        if (debugHandles) {
            drawPoint(curr, "");
            drawLine(curr, currHandle, debugHandlesOutColor);
            drawLine(next, nextHandle, debugHandlesInColor);
        }

        // Draw curve between curr and next points.
        ctx.beginPath();
        ctx.moveTo(curr.x, curr.y);
        ctx.bezierCurveTo(currHandle.x, currHandle.y, nextHandle.x, nextHandle.y, next.x, next.y);
        ctx.stroke();
    }
};

const testSplitAt = (percentage: number) => {
    let points: Point[] = [
        point(0.15, 0.15, 135, 0.1, 315, 0.2),
        point(0.85, 0.15, 225, 0.1, 45, 0.2),
        point(0.85, 0.85, 315, 0.1, 135, 0.2),
        point(0.15, 0.85, 45, 0.1, 225, 0.2),
    ];

    const count = points.length;
    const stop = 2 * count - 1;
    for (let i = 0; i < count; i++) {
        const double = i * 2;
        const next = (double + 1) % stop;
        points.splice(double, 2, ...splitCurveAt(percentage, points[double], points[next]));
    }
    points.splice(0, 1);

    let length = 0;
    for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        length += approxCurveLength(curr, next);
    }
    drawInfo("split at lengths sum", length);

    renderShape(points);
};

const testSplitBy = () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        renderShape(
            splitCurveBy(
                i + 1,
                point(0.15, 0.2 + i * 0.06, 30, 0.1, -30, 0.1),
                point(0.45, 0.2 + i * 0.06, 135, 0.1, 225, 0.1),
            ),
        );
    }
};

const testDivideShape = () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        renderShape(
            divideShape(i + 3, [
                point(0.6, 0.2 + i * 0.05, -10, 0.1, -45, 0.03),
                point(0.7, 0.2 + i * 0.05 - 0.03, 180, 0.03, 0, 0.03),
                point(0.8, 0.2 + i * 0.05, -135, 0.03, 170, 0.1),
            ]),
        );
    }
};

(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    document.body.appendChild(canvas);

    const temp = canvas.getContext("2d");
    if (temp === null) throw new Error("context is null");
    ctx = temp;

    let percentage = animationStart;
    const renderFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawInfo("percentage", percentage);
        testSplitAt(percentage);
        testSplitBy();
        testDivideShape();
        percentage += animationSpeed / 1000;
        percentage %= 1;
        if (animationSpeed > 0) requestAnimationFrame(renderFrame);
    };
    renderFrame();
})();
