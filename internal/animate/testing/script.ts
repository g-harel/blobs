import {interpolateBetweenSmooth} from "../interpolate";
import {divide, prepare} from "../prepare";
import {Coord, Point} from "../../types";
import {length, insertAt, insertCount, rad, mod, mapPoints, forPoints} from "../../util";
import {clear, drawInfo, drawClosed} from "../../render/canvas";
import {genBlob} from "../../gen";
import {rand} from "../../rand";
import * as blobs2 from "../../../public/blobs";

let animationSpeed = 2;
let animationStart = 0.3;
let debug = true;
let size = 1300;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.height = size;
canvas.width = size;
const temp = canvas.getContext("2d");
if (temp === null) throw new Error("context is null");
const ctx = temp;

const toggle = document.getElementById("toggle");
if (toggle === null) throw new Error("no toggle");
toggle.onclick = () => (debug = !debug);

const point = (x: number, y: number, ia: number, il: number, oa: number, ol: number): Point => {
    return {
        x: x * size,
        y: y * size,
        handleIn: {angle: rad(ia), length: il * size},
        handleOut: {angle: rad(oa), length: ol * size},
    };
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
        const next = mod(double + 1, stop);
        points.splice(double, 2, ...insertAt(percentage, points[double], points[next]));
    }
    points.splice(0, 1);

    let sum = 0;
    forPoints(points, ({curr, next}) => {
        sum += length(curr, next());
    });
    drawInfo(ctx, 1, "split at lengths sum", sum);

    drawClosed(ctx, debug, points);
};

const testSplitBy = () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        drawClosed(
            ctx,
            debug,
            insertCount(
                i + 1,
                point(0.15, 0.2 + i * 0.06, 30, 0.04, -30, 0.04),
                point(0.25, 0.2 + i * 0.06, 135, 0.04, 225, 0.04),
            ),
        );
    }
};

const testDividePoints = () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        drawClosed(
            ctx,
            debug,
            divide(i + 3, [
                point(0.3, 0.2 + i * 0.05, -10, 0.04, -45, 0.02),
                point(0.35, 0.2 + i * 0.05 - 0.02, 180, 0.02, 0, 0.02),
                point(0.4, 0.2 + i * 0.05, -135, 0.02, 170, 0.04),
            ]),
        );
    }
};

const testInterpolateBetween = (percentage: number) => {
    const a = [
        point(0.3, 0.72, 135, 0.05, -45, 0.05),
        point(0.4, 0.72, -135, 0.05, 45, 0.05),
        point(0.4, 0.82, -45, 0.05, 135, 0.05),
        point(0.3, 0.82, 45, 0.05, 225, 0.05),
    ];
    const b = [
        point(0.35, 0.72, 180, 0, 0, 0),
        point(0.4, 0.77, -90, 0, 90, 0),
        point(0.35, 0.82, 360 * 10, 0, 180, 0),
        point(0.3, 0.77, 90, 0, -90, 0),
    ];
    drawClosed(ctx, debug, loopBetween(percentage, a, b));
};

const testPrepPointsA = (percentage: number) => {
    const a = blob("a", 6, 0.15, {x: 0.45, y: 0.1});
    const b = blob("b", 10, 0.15, {x: 0.45, y: 0.1});
    drawClosed(
        ctx,
        debug,
        loopBetween(percentage, ...prepare(a, b, {rawAngles: false, divideRatio: 1})),
    );
};

const testPrepPointsB = (percentage: number) => {
    const a = blob("a", 8, 0.15, {x: 0.45, y: 0.25});
    const b: Point[] = [
        point(0.45, 0.25, 0, 0, 0, 0),
        point(0.6, 0.25, 0, 0, 0, 0),
        point(0.6, 0.4, 0, 0, 0, 0),
        point(0.45, 0.4, 0, 0, 0, 0),
    ];
    drawClosed(
        ctx,
        debug,
        loopBetween(percentage, ...prepare(a, b, {rawAngles: false, divideRatio: 1})),
    );
};

const testPrepPointsC = (percentage: number) => {
    const a = blob("c", 8, 0.15, {x: 0.45, y: 0.45});
    const b: Point[] = [
        point(0.5, 0.45, 0, 0, 0, 0),
        point(0.55, 0.45, 0, 0, 0, 0),
        point(0.55, 0.5, 0, 0, 0, 0),
        point(0.6, 0.5, 0, 0, 0, 0),
        point(0.6, 0.55, 0, 0, 0, 0),
        point(0.55, 0.55, 0, 0, 0, 0),
        point(0.55, 0.6, 0, 0, 0, 0),
        point(0.5, 0.6, 0, 0, 0, 0),
        point(0.5, 0.55, 0, 0, 0, 0),
        point(0.45, 0.55, 0, 0, 0, 0),
        point(0.45, 0.5, 0, 0, 0, 0),
        point(0.5, 0.5, 0, 0, 0, 0),
    ];
    drawClosed(
        ctx,
        debug,
        loopBetween(percentage, ...prepare(b, a, {rawAngles: false, divideRatio: 1})),
    );
};

const testPrepPointsD = (percentage: number) => {
    const a = blob("d", 8, 0.15, {x: 0.45, y: 0.65});
    const b: Point[] = [
        point(0.525, 0.725, 0, 0, 0, 0),
        point(0.525, 0.725, 0, 0, 0, 0),
        point(0.525, 0.725, 0, 0, 0, 0),
    ];
    drawClosed(
        ctx,
        debug,
        loopBetween(percentage, ...prepare(a, b, {rawAngles: false, divideRatio: 1})),
    );
};

const testPrepLetters = (percentage: number) => {
    const a: Point[] = [
        point(0.65, 0.2, 0, 0, 0, 0),
        point(0.85, 0.2, 0, 0, 0, 0),
        point(0.85, 0.25, 0, 0, 0, 0),
        point(0.7, 0.25, 0, 0, 0, 0),
        point(0.7, 0.4, 0, 0, 0, 0),
        point(0.8, 0.4, 0, 0, 0, 0),
        point(0.8, 0.35, 0, 0, 0, 0),
        point(0.75, 0.35, 0, 0, 0, 0),
        point(0.75, 0.3, 0, 0, 0, 0),
        point(0.85, 0.3, 0, 0, 0, 0),
        point(0.85, 0.45, 0, 0, 0, 0),
        point(0.65, 0.45, 0, 0, 0, 0),
    ];
    const b: Point[] = blob("", 8, 0.25, {x: 0.65, y: 0.2});
    drawClosed(
        ctx,
        debug,
        loopBetween(percentage, ...prepare(a, b, {rawAngles: false, divideRatio: 1})),
    );
};

const testGen = () => {
    const cellSideCount = 16;
    const cellSize = size / cellSideCount;
    ctx.save();
    ctx.strokeStyle = "#fafafa";
    ctx.fillStyle = "#f1f1f1";
    for (let i = 0; i < cellSideCount; i++) {
        for (let j = 0; j < cellSideCount; j++) {
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            ctx.fill(
                blobs2.canvasPath(
                    {
                        extraPoints: j,
                        randomness: i,
                        seed: i + j - i * j,
                        size: cellSize,
                    },
                    {
                        offsetX: i * cellSize,
                        offsetY: j * cellSize,
                    },
                ),
            );
        }
    }
    ctx.restore();
};

const blob = (seed: string, count: number, scale: number, offset: Coord): Point[] => {
    const rgen = rand(seed);
    const points = genBlob(count, () => 0.3 + 0.2 * rgen());
    return mapPoints(points, ({curr}) => {
        curr.x *= scale * size;
        curr.y *= scale * size;
        curr.x += offset.x * size;
        curr.y += offset.y * size;
        curr.handleIn.length *= scale * size;
        curr.handleOut.length *= scale * size;
        return curr;
    });
};

const loopBetween = (percentage: number, a: Point[], b: Point[]): Point[] => {
    // Draw before/after shapes + point path.
    ctx.save();
    ctx.strokeStyle = "#ffaaaa";
    drawClosed(ctx, false, a);
    ctx.strokeStyle = "#aaaaff";
    drawClosed(ctx, false, b);
    ctx.strokeStyle = "#33ff33";
    for (let i = 0; i < a.length; i++) {
        ctx.beginPath();
        ctx.moveTo(a[i].x, a[i].y);
        ctx.lineTo(b[i].x, b[i].y);
        ctx.stroke();
    }
    ctx.restore();

    if (percentage < 0.5) {
        return interpolateBetweenSmooth(1, 2 * percentage, a, b);
    } else {
        return interpolateBetweenSmooth(1, -2 * percentage + 2, a, b);
    }
};

(() => {
    let percentage = animationStart;

    const renderFrame = () => {
        clear(ctx);

        testGen();
        drawInfo(ctx, 0, "percentage", percentage);
        testSplitAt(percentage);
        testSplitBy();
        testDividePoints();
        testInterpolateBetween(percentage);
        testPrepPointsA(percentage);
        testPrepPointsB(percentage);
        testPrepPointsC(percentage);
        testPrepPointsD(percentage);
        testPrepLetters(percentage);

        percentage += animationSpeed / 1000;
        percentage = mod(percentage, 1);
        if (animationSpeed > 0) requestAnimationFrame(renderFrame);
    };
    renderFrame();
})();
