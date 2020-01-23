import blobs from "..";

import {canvasClear, canvasSize, drawInfo, drawShape} from "./draw";
import {interpolateBetweenLoop} from "./interpolate";
import {approxCurveLength, divideShape, prepShapes, splitCurveAt, splitCurveBy} from "./prep";
import {Coord, Point} from "./types";

const animationSpeed = 2;
const animationStart = 0.3;
const debug = true;
const size = 1000;

const rad = (deg: number) => {
    return (deg / 360) * 2 * Math.PI;
};

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

    drawShape(debug, points);
};

const testSplitBy = () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        drawShape(
            debug,
            splitCurveBy(
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
    drawShape(debug, interpolateBetweenLoop(percentage, a, b));
};

const testPrepShapesA = (percentage: number) => {
    const a = genBlob("a", 0.6, 0.6, 0.3, {x: 0.5, y: 0.2});
    const b = genBlob("b", 1, 0.6, 0.3, {x: 0.5, y: 0.2});
    drawShape(debug, interpolateBetweenLoop(percentage, ...prepShapes(a, b)));
};

const testPrepShapesB = (percentage: number) => {
    const a = genBlob("a", 0.6, 0.6, 0.3, {x: 0.5, y: 0.5});
    const b: Point[] = [
        point(0.55, 0.5, 0, 0, 0, 0),
        point(0.75, 0.5, 0, 0, 0, 0),
        point(0.75, 0.7, 0, 0, 0, 0),
        point(0.55, 0.7, 0, 0, 0, 0),
    ];
    drawShape(debug, interpolateBetweenLoop(percentage, ...prepShapes(a, b)));
};

const genBlob = (
    seed: string,
    complexity: number,
    contrast: number,
    s: number,
    offset: Coord,
): Point[] => {
    const original = blobs.path({
        complexity,
        contrast,
        size: s * size,
        seed,
    });
    const out: Point[] = [];
    for (let i = 0; i < original.length; i++) {
        const p = original[i];
        if (!p.handles) continue;
        out.push(
            point(
                p.x / size + offset.x,
                p.y / size + offset.y,
                p.handles.angle + 180,
                p.handles.in / size,
                p.handles.angle,
                p.handles.out / size,
            ),
        );
    }
    return out;
};

(() => {
    let percentage = animationStart;

    const renderFrame = () => {
        canvasClear();
        canvasSize(size, size);

        drawInfo("percentage", percentage);
        testSplitAt(percentage);
        testSplitBy();
        testDivideShape();
        testInterpolateBetween(percentage);
        testPrepShapesA(percentage);
        testPrepShapesB(percentage);

        percentage += animationSpeed / 1000;
        percentage %= 1;
        if (animationSpeed > 0) requestAnimationFrame(renderFrame);
    };
    renderFrame();
})();
