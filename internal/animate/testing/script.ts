import {interpolateBetweenSmooth} from "../interpolate";
import {divide, prepare} from "../prepare";
import {Coord, Point} from "../../types";
import {length, insertAt, insertCount, rad, mod, mapPoints, forPoints} from "../../util";
import {clear, drawInfo, drawClosed} from "../../render/canvas";
import {genBlob, genFromOptions} from "../../gen";
import {noise, rand} from "../../rand";
import * as blobs2 from "../../../public/blobs";
import * as blobs2Animate from "../../../public/animate";

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

const interact = document.getElementById("interact") as any;
if (toggle === null) throw new Error("no interact");
const addInteraction = (newOnclick: () => void) => {
    const oldOnclick = interact.onclick || (() => 0);
    interact.onclick = () => {
        oldOnclick();
        newOnclick();
    };
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

const genBlobAnimation = (
    speed: number,
    offset: number,
    timing: blobs2Animate.CanvasKeyframe["timingFunction"],
    timeWarp: number,
) => {
    const animation = blobs2Animate.canvasPath(() => Date.now() * timeWarp);

    const loopAnimation = () => {
        animation.transition(
            {
                duration: speed,
                delay: speed,
                timingFunction: "ease",
                blobOptions: {
                    extraPoints: 3,
                    randomness: 4,
                    seed: Math.random(),
                    size: 200,
                },
                canvasOptions: {
                    offsetX: offset,
                },
            },
            {
                duration: speed,
                timingFunction: "ease",
                blobOptions: {
                    extraPoints: 3,
                    randomness: 4,
                    seed: Math.random(),
                    size: 200,
                },
                canvasOptions: {
                    offsetX: offset,
                },
            },
            {
                duration: speed,
                delay: speed,
                timingFunction: "ease",
                blobOptions: {
                    extraPoints: 3,
                    randomness: 4,
                    seed: Math.random(),
                    size: 200,
                },
                canvasOptions: {
                    offsetX: offset,
                },
            },
            {
                duration: speed,
                callback: loopAnimation,
                timingFunction: "ease",
                blobOptions: {
                    extraPoints: 39,
                    randomness: 2,
                    seed: Math.random(),
                    size: 200,
                },
                canvasOptions: {
                    offsetX: offset,
                },
            },
        );
    };

    animation.transition({
        duration: 0,
        callback: loopAnimation,
        blobOptions: {
            extraPoints: 1,
            randomness: 0,
            seed: 0,
            size: 200,
        },
        canvasOptions: {
            offsetX: offset,
        },
    });

    addInteraction(() => {
        animation.transition({
            duration: speed,
            callback: loopAnimation,
            timingFunction: timing,
            blobOptions: {
                extraPoints: 30,
                randomness: 8,
                seed: Math.random(),
                size: 180,
            },
            canvasOptions: {
                offsetX: 10 + offset,
                offsetY: 10,
            },
        });
    });

    return animation;
};

const genCustomAnimation = (speed: number, offset: number) => {
    const noHandles = {handleIn: {angle: 0, length: 0}, handleOut: {angle: 0, length: 0}};
    const animation = blobs2Animate.canvasPath();
    const loopAnimation = (immediate: boolean = false) => {
        const size = 200;
        animation.transition(
            {
                duration: immediate ? 0 : speed,
                delay: 100,
                timingFunction: "elasticEnd0",
                blobOptions: {
                    extraPoints: 3,
                    randomness: 4,
                    seed: Math.random(),
                    size: size,
                },
                canvasOptions: {offsetX: offset, offsetY: 220},
            },
            {
                duration: speed,
                delay: 100,
                timingFunction: "elasticEnd0",
                points: [
                    {x: 0, y: 0, ...noHandles},
                    {x: 0, y: size, ...noHandles},
                    {x: size, y: size, ...noHandles},
                    {x: size, y: 0, ...noHandles},
                ],
                canvasOptions: {offsetX: offset, offsetY: 220},
                callback: loopAnimation,
            },
        );
    };
    loopAnimation(true);
    addInteraction(() => animation.playPause());
    return animation;
};

const wigglePreset = (
    animation: blobs2Animate.Animation,
    config: {
        blobOptions: blobs2.BlobOptions;
        period: number;
        delay?: number;
        timingFunction?: blobs2Animate.CanvasKeyframe["timingFunction"];
        canvasOptions?: {
            offsetX?: number;
            offsetY?: number;
        };
    },
) => {
    const targetBlob: Point[] = genFromOptions(config.blobOptions);
    const numberOfPoints = 3 + config.blobOptions.extraPoints;
    const mutatesPerPeriod = 1 * numberOfPoints;
    const mutateInterval = config.period / mutatesPerPeriod;
    const mutateRatio = 1 / mutatesPerPeriod;

    console.log(
        "mutatesPerPeriod",
        mutatesPerPeriod,
        "mutateInterval",
        mutateInterval,
        "mutateRatio",
        mutateRatio,
        "config",
        JSON.stringify(config),
    );

    const loopAnimation = () => {
        const newBlob = genFromOptions(Object.assign(config.blobOptions, {seed: Math.random()}));
        for (let i = 0; i < newBlob.length; i++) {
            if (Math.random() < mutateRatio) {
                targetBlob[i] = newBlob[i];
            }
        }
        animation.transition({
            duration: config.period,
            timingFunction: config.timingFunction,
            canvasOptions: config.canvasOptions,
            points: targetBlob,
        });
    };
    animation.transition({
        duration: 0,
        delay: config.delay || 0,
        timingFunction: config.timingFunction,
        canvasOptions: config.canvasOptions,
        points: genFromOptions(config.blobOptions),
        callback: () => setInterval(loopAnimation, mutateInterval),
    });
    addInteraction(() => animation.playPause());
};

const genBadWiggle = (period: number, offset: number) => {
    const animation = blobs2Animate.canvasPath();
    wigglePreset(animation, {
        blobOptions: {
            extraPoints: 1,
            randomness: 4,
            seed: Math.random(),
            size: 200,
        },
        period,
        timingFunction: "ease",
        canvasOptions: {offsetX: offset, offsetY: 220},
    });
    return animation;
};

interface WiggleOptions {
    speed: number;
    delay?: number;
}

const wiggle = (
    animation: blobs2Animate.Animation,
    blobOptions: blobs2.BlobOptions,
    canvasOptions: blobs2.CanvasOptions,
    wiggleOptions: WiggleOptions,
) => {
    const leapSize = 0.01 * wiggleOptions.speed;

    // Interval at which a new sample is taken.
    // Multiple of 16 to do work every N frames.
    const intervalMs = 16 * 5;

    const noiseField = noise(String(blobOptions.seed));

    let count = 0;
    const loopAnimation = (first?: boolean, delay?: number) => {
        count++;
        animation.transition({
            duration: first ? 0 :  intervalMs,
            delay: delay || 0,
            timingFunction: "linear",
            canvasOptions,
            points: genFromOptions(blobOptions, (index) => {
                return noiseField(leapSize * count, index);
            }),
            callback: loopAnimation,
        });
    };
    loopAnimation(true, wiggleOptions.delay);
};

const genWiggle = (offset: number, speed: number) => {
    const animation = blobs2Animate.canvasPath();
    wiggle(
        animation,
        {
            extraPoints: 4,
            randomness: 2,
            seed: Math.random(),
            size: 200,
        },
        {offsetX: offset, offsetY: 220},
        {speed},
    );
    addInteraction(() => animation.playPause());
    return animation;
};

(() => {
    let percentage = animationStart;

    const animations = [
        genBlobAnimation(500, 0, "elasticEnd0", 1),
        genBlobAnimation(500, 200, "elasticEnd1", 1),
        genBlobAnimation(500, 400, "elasticEnd2", 1),
        genBlobAnimation(500, 600, "elasticEnd3", 1),
        genBlobAnimation(500, 800, "elasticEnd3", 0.1),
        genCustomAnimation(1000, 0),
        genBadWiggle(200, 200),
        genWiggle(400, 5),
    ];

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

        for (const animation of animations) {
            ctx.save();
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "rgba(255, 200, 0, 0.5)";
            const path = animation.renderFrame();
            ctx.stroke(path);
            ctx.fill(path);
            ctx.restore();
        }

        percentage += animationSpeed / 1000;
        percentage = mod(percentage, 1);
        if (animationSpeed > 0) requestAnimationFrame(renderFrame);
    };
    renderFrame();
})();
