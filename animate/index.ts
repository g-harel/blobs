// http://www.cad.zju.edu.cn/home/zhx/papers/PoissonMorphing.pdf
// https://medium.com/@adrian_cooney/bezier-interpolation-13b68563313a

import {loopAccess} from "../internal/svg/util";
import {rad} from "../internal/math/unit";

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

const handleOffset = (distance: number, angle: number): {x: number; y: number} => {
    return {
        x: distance * Math.cos(angle),
        y: distance * Math.sin(angle),
    };
};

const render = (canvas: HTMLCanvasElement, points: Point[]) => {
    if (points.length < 3) throw new Error("not enough points");

    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("context is null");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw points.
    for (let i = 0; i < points.length; i++) {
        // Compute coordinates of handles.
        const curr = loopAccess(points)(i);
        const next = loopAccess(points)(i + 1);
        const currHandle = handleOffset(curr.handleOut.length, curr.handleOut.angle);
        const nextHandle = handleOffset(next.handleIn.length, next.handleIn.angle);

        // Draw dot on point.
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Draw outgoing handle.
        ctx.beginPath();
        ctx.moveTo(curr.x, curr.y);
        ctx.lineTo(curr.x + currHandle.x, curr.y + currHandle.y);
        ctx.strokeStyle = "#F0F";
        ctx.stroke();
        ctx.strokeStyle = "#000";

        // Draw incoming handle.
        ctx.beginPath();
        ctx.moveTo(next.x, next.y);
        ctx.lineTo(next.x + nextHandle.x, next.y + nextHandle.y);
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw curve between curr and next points.
        ctx.beginPath();
        ctx.moveTo(curr.x, curr.y);
        ctx.bezierCurveTo(
            curr.x + currHandle.x,
            curr.y + currHandle.y,
            next.x + nextHandle.x,
            next.y + nextHandle.y,
            next.x,
            next.y,
        );
        ctx.stroke();
    }
};

(() => {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.width = 1000;
    canvas.height = 1000;

    const points: Point[] = [
        {
            x: 200,
            y: 200,
            handleOut: {
                angle: rad(315),
                length: 200,
            },
            handleIn: {
                angle: rad(135),
                length: 100,
            },
        },
        {
            x: 800,
            y: 200,
            handleOut: {
                angle: rad(45),
                length: 200,
            },
            handleIn: {
                angle: rad(225),
                length: 100,
            },
        },
        {
            x: 800,
            y: 800,
            handleOut: {
                angle: rad(135),
                length: 200,
            },
            handleIn: {
                angle: rad(315),
                length: 100,
            },
        },
        {
            x: 200,
            y: 800,
            handleOut: {
                angle: rad(225),
                length: 200,
            },
            handleIn: {
                angle: rad(45),
                length: 100,
            },
        },
    ];

    const renderFrame = () => {
        for (const point of points) {
            point.handleIn.angle += Math.PI / 600;
            point.handleOut.angle += Math.PI / 600;
        }
        render(canvas, points);
        requestAnimationFrame(renderFrame);
    };
    renderFrame();
})();
