import {interpolateBetweenSmooth} from "../interpolate";
import {divideShape, prepShapes} from "../prepare";
import {Coord, Point, Shape} from "../../types";
import {length, insertAt, insertCount, rad, mod, mapShape, forShape, smooth} from "../../util";
import {clear, drawInfo, drawShape} from "../../render/canvas";
import {genBlob} from "../../blobs";
import {rand} from "../../rand";

let animationSpeed = 2;
let animationStart = 0.3;
let debug = true;
let size = 1000;

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
    let shape: Shape = [
        point(0.15, 0.15, 135, 0.1, 315, 0.2),
        point(0.85, 0.15, 225, 0.1, 45, 0.2),
        point(0.85, 0.85, 315, 0.1, 135, 0.2),
        point(0.15, 0.85, 45, 0.1, 225, 0.2),
    ];

    const count = shape.length;
    const stop = 2 * count - 1;
    for (let i = 0; i < count; i++) {
        const double = i * 2;
        const next = mod(double + 1, stop);
        shape.splice(double, 2, ...insertAt(percentage, shape[double], shape[next]));
    }
    shape.splice(0, 1);

    let sum = 0;
    forShape(shape, ({curr, next}) => {
        sum += length(curr, next());
    });
    drawInfo(ctx, 1, "split at lengths sum", sum);

    drawShape(ctx, debug, shape);
};

const testSplitBy = () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        drawShape(
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

const testDivideShape = () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        drawShape(
            ctx,
            debug,
            divideShape(i + 3, [
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
    drawShape(ctx, debug, loopBetween(percentage, a, b));
};

const testPrepShapesA = (percentage: number) => {
    const a = blob("a", 6, 0.15, {x: 0.45, y: 0.1});
    const b = blob("b", 10, 0.15, {x: 0.45, y: 0.1});
    drawShape(ctx, debug, loopBetween(percentage, ...prepShapes(a, b)));
};

const testPrepShapesB = (percentage: number) => {
    const a = blob("a", 8, 0.15, {x: 0.45, y: 0.25});
    const b: Shape = [
        point(0.45, 0.25, 0, 0, 0, 0),
        point(0.6, 0.25, 0, 0, 0, 0),
        point(0.6, 0.4, 0, 0, 0, 0),
        point(0.45, 0.4, 0, 0, 0, 0),
    ];
    drawShape(ctx, debug, loopBetween(percentage, ...prepShapes(a, b)));
};

const testPrepShapesC = (percentage: number) => {
    const a = blob("c", 8, 0.15, {x: 0.45, y: 0.45});
    const b: Shape = [
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
    drawShape(ctx, debug, loopBetween(percentage, ...prepShapes(b, a)));
};

const testPrepShapesD = (percentage: number) => {
    const a = blob("d", 8, 0.15, {x: 0.45, y: 0.65});
    const b: Shape = [
        point(0.525, 0.725, 0, 0, 0, 0),
        point(0.525, 0.725, 0, 0, 0, 0),
        point(0.525, 0.725, 0, 0, 0, 0),
    ];
    drawShape(ctx, debug, loopBetween(percentage, ...prepShapes(a, b)));
};

const testPrepLetters = (percentage: number) => {
    const a: Shape = [
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
    const b: Shape = blob("lettersa", 8, 0.25, {x: 0.65, y: 0.2});
    drawShape(ctx, debug, loopBetween(percentage, ...prepShapes(a, b)));
};

const blob = (seed: string, count: number, scale: number, offset: Coord): Shape => {
    const rgen = rand(seed);
    const shape = genBlob(count, () => 0.3 + 0.2 * rgen());
    return mapShape(shape, ({curr}) => {
        curr.x *= scale * size;
        curr.y *= scale * size;
        curr.x += offset.x * size;
        curr.y += offset.y * size;
        curr.handleIn.length *= scale * size;
        curr.handleOut.length *= scale * size;
        return curr;
    });
};

const loopBetween = (percentage: number, a: Shape, b: Shape): Shape => {
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

        drawInfo(ctx, 0, "percentage", percentage);
        testSplitAt(percentage);
        testSplitBy();
        testDivideShape();
        testInterpolateBetween(percentage);
        testPrepShapesA(percentage);
        testPrepShapesB(percentage);
        testPrepShapesC(percentage);
        testPrepShapesD(percentage);
        testPrepLetters(percentage);

        percentage += animationSpeed / 1000;
        percentage = mod(percentage, 1);
        if (animationSpeed > 0) requestAnimationFrame(renderFrame);
    };
    renderFrame();
})();
