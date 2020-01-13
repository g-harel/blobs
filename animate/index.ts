// http://www.cad.zju.edu.cn/home/zhx/papers/PoissonMorphing.pdf
// https://medium.com/@adrian_cooney/bezier-interpolation-13b68563313a
// http://www.iscriptdesign.com/?sketch=tutorial/splitbezier

import {loopAccess} from "../internal/svg/util";
import {rad} from "../internal/math/unit";

let ctx: CanvasRenderingContext2D;

const speed: number = 2;
const debugHandles = true;
const debugBezier = false;

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

const drawLine = (a: Coordinates, b: Coordinates, style: string = "#8bb") => {
    const backupStrokeStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = style;
    ctx.stroke();
    ctx.strokeStyle = backupStrokeStyle;
};

const drawPoint = (p: Coordinates, style: string = "#8bb") => {
    const backupFillStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = style;
    ctx.fill();
    ctx.fillStyle = backupFillStyle;
};

const splitLine = (percentage: number, a: Coordinates, b: Coordinates): Coordinates => {
    return {
        x: a.x + percentage * (b.x - a.x),
        y: a.y + percentage * (b.y - a.y),
    };
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
const splitCurve = (percentage: number, a: Point, b: Point): [Point, Point, Point] => {
    const c: Point = {
        x: a.x,
        y: a.y,
        handleIn: {
            angle: a.handleIn.angle,
            length: a.handleIn.length,
        },
        handleOut: {
            angle: a.handleOut.angle,
            length: a.handleOut.length * percentage,
        },
    };
    const e: Point = {
        x: b.x,
        y: b.y,
        handleIn: {
            angle: b.handleIn.angle,
            length: b.handleIn.length * (1 - percentage),
        },
        handleOut: {
            angle: b.handleOut.angle,
            length: b.handleOut.length,
        },
    };

    const aHandle = expandHandle(a, a.handleOut);
    const bHandle = expandHandle(b, b.handleIn);
    const cHandle = expandHandle(c, c.handleOut);
    const eHandle = expandHandle(e, e.handleIn);
    const f = splitLine(percentage, aHandle, bHandle);
    const g = splitLine(percentage, cHandle, f);
    const h = splitLine(1 - percentage, eHandle, f);
    const dCoordinates = splitLine(percentage, g, h);

    if (debugBezier) {
        drawLine(b, bHandle);
        drawLine(a, aHandle);
        drawLine(aHandle, bHandle);
        drawLine(cHandle, f);
        drawLine(eHandle, f);
        drawLine(g, h);
        if (!debugHandles) {
            drawPoint(dCoordinates);
            drawLine(dCoordinates, g);
            drawLine(dCoordinates, h);
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

const render = (points: Point[]) => {
    if (points.length < 3) throw new Error("not enough points");

    // Draw points.
    for (let i = 0; i < points.length; i++) {
        // Compute coordinates of handles.
        const curr = loopAccess(points)(i);
        const next = loopAccess(points)(i + 1);
        const currHandle = expandHandle(curr, curr.handleOut);
        const nextHandle = expandHandle(next, next.handleIn);

        if (debugHandles) {
            drawPoint(curr, "#000");
            drawLine(curr, currHandle, "#6bb");
            drawLine(next, nextHandle, "#b6b");
        }

        // Draw curve between curr and next points.
        ctx.beginPath();
        ctx.moveTo(curr.x, curr.y);
        ctx.bezierCurveTo(currHandle.x, currHandle.y, nextHandle.x, nextHandle.y, next.x, next.y);
        ctx.stroke();
    }
};

const renderTestShape = (percentage: number) => {
    let points: Point[] = [
        {
            x: 200,
            y: 200,
            handleIn: {
                angle: rad(135),
                length: 100,
            },
            handleOut: {
                angle: rad(315),
                length: 200,
            },
        },
        {
            x: 800,
            y: 200,
            handleIn: {
                angle: rad(225),
                length: 100,
            },
            handleOut: {
                angle: rad(45),
                length: 200,
            },
        },
        {
            x: 800,
            y: 800,
            handleIn: {
                angle: rad(315),
                length: 100,
            },
            handleOut: {
                angle: rad(135),
                length: 200,
            },
        },
        {
            x: 200,
            y: 800,
            handleIn: {
                angle: rad(45),
                length: 100,
            },
            handleOut: {
                angle: rad(225),
                length: 200,
            },
        },
    ];

    const count = points.length;
    const stop = 2 * count - 1;
    for (let i = 0; i < count; i++) {
        const double = i * 2;
        const next = (double + 1) % stop;
        points.splice(double, 2, ...splitCurve(percentage, points[double], points[next]));
    }
    points.splice(0, 1);

    render(points);
};

const renderTestCurve = (percentage: number) => {
    render(
        splitCurve(
            percentage,
            {
                x: 300,
                y: 300,
                handleIn: {angle: 0, length: 0},
                handleOut: {angle: 0, length: 400},
            },
            {
                x: 700,
                y: 700,
                handleIn: {angle: Math.PI, length: 400},
                handleOut: {angle: 0, length: 0},
            },
        ),
    );
};

(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    document.body.appendChild(canvas);

    const temp = canvas.getContext("2d");
    if (temp === null) throw new Error("context is null");
    ctx = temp;

    let percentage = 0;
    const renderFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderTestCurve(percentage);
        renderTestShape(percentage);
        percentage += speed / 1000;
        percentage %= 1;
        if (speed > 0) requestAnimationFrame(renderFrame);
    };
    renderFrame();
})();
