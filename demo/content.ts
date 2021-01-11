import {addCanvas, addTitle, colors, sizes} from "./internal/layout";
import {
    point,
    drawOpen,
    calcBouncePercentage,
    drawLine,
    drawPoint,
    tempStyles,
    drawClosed,
    forceStyles,
} from "./internal/canvas";
import {
    split,
    expandHandle,
    splitLine,
    forPoints,
    mapPoints,
    coordPoint,
    distance,
    mod,
    shift,
} from "../internal/util";
import {timingFunctions} from "../internal/animate/timing";
import {Coord, Point} from "../internal/types";
import {rand} from "../internal/rand";
import {genFromOptions} from "../internal/gen";
import {BlobOptions} from "../public/blobs";
import {interpolateBetween, interpolateBetweenSmooth} from "../internal/animate/interpolate";
import {divide} from "../internal/animate/prepare";

const makePoly = (pointCount: number, radius: number, center: Coord): Point[] => {
    const angle = (2 * Math.PI) / pointCount;
    const points: Point[] = [];
    const nullHandle = {angle: 0, length: 0};
    for (let i = 0; i < pointCount; i++) {
        const coord = expandHandle(center, {angle: i * angle, length: radius});
        points.push({...coord, handleIn: nullHandle, handleOut: nullHandle});
    }
    return points;
};

const centeredBlob = (options: BlobOptions, center: Coord): Point[] => {
    return mapPoints(genFromOptions(options), ({curr}) => {
        curr.x += center.x - options.size / 2;
        curr.y += center.y - options.size / 2;
        return curr;
    });
};

const calcFullDetails = (percentage: number, a: Point, b: Point) => {
    const a0: Coord = a;
    const a1 = expandHandle(a, a.handleOut);
    const a2 = expandHandle(b, b.handleIn);
    const a3: Coord = b;

    const b0 = splitLine(percentage, a0, a1);
    const b1 = splitLine(percentage, a1, a2);
    const b2 = splitLine(percentage, a2, a3);
    const c0 = splitLine(percentage, b0, b1);
    const c1 = splitLine(percentage, b1, b2);
    const d0 = splitLine(percentage, c0, c1);

    return {a0, a1, a2, a3, b0, b1, b2, c0, c1, d0};
};

addTitle(4, "What are vector graphics?");

addCanvas(
    1.3,
    // Pixelated circle.
    (ctx, width, height) => {
        const center: Coord = {x: width * 0.5, y: height * 0.5};
        const gridSize = width * 0.01;
        const gridCountX = width / gridSize;
        const gridCountY = height / gridSize;

        // https://www.desmos.com/calculator/psohl602g5
        const radius = width * 0.3;
        const falloff = width * 0.0015;
        const thickness = width * 0.007;

        for (let x = 0; x < gridCountX; x++) {
            for (let y = 0; y < gridCountY; y++) {
                const curr = {x: x * gridSize + gridSize / 2, y: y * gridSize + gridSize / 2};
                const d = distance(curr, center);
                const opacity = Math.max(
                    0,
                    Math.min(1, Math.abs(thickness / (d - radius)) - falloff),
                );

                tempStyles(
                    ctx,
                    () => {
                        ctx.globalAlpha = opacity;
                        ctx.fillStyle = colors.highlight;
                    },
                    () => ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize),
                );
            }
        }

        return `Raster formats store pixel information and have a fixed resolution.`;
    },
    // Smooth circle.
    (ctx, width, height) => {
        const pt = width * 0.01;
        const shapeSize = width * 0.6;
        const cx = width * 0.5;
        const cy = height * 0.5;

        tempStyles(
            ctx,
            () => {
                ctx.lineWidth = pt;
                ctx.strokeStyle = colors.highlight;
            },
            () => {
                ctx.beginPath();
                ctx.arc(cx, cy, shapeSize / 2, 0, 2 * Math.PI);
                ctx.stroke();
            },
        );

        return `Vector formats use formulas to draw the image at any scale. they are ideal fo
            artwork with sharp lines that will be viewed at varying sizes.`;
    },
);

addCanvas(2, (ctx, width, height, animate) => {
    const startPeriod = Math.E * 1000;
    const endPeriod = Math.PI * 1000;

    // TODO animate handle length.
    animate((frameTime) => {
        const startPercentage = calcBouncePercentage(startPeriod, timingFunctions.ease, frameTime);
        const startAngle = split(startPercentage, -45, +45);
        const start = point(width * 0.2, height * 0.5, 0, 0, startAngle, width * 0.25);

        const endPercentage = calcBouncePercentage(endPeriod, timingFunctions.ease, frameTime);
        const endAngle = split(endPercentage, 135, 225);
        const end = point(width * 0.8, height * 0.5, endAngle, width * 0.25, 0, 0);

        drawOpen(ctx, start, end, true);
    });

    return `Vector graphics are commonly defined using Bezier curves. The cubic bezier is made up of
        four coordinates: the start/end points and their corresponding "handles". These handles can
        be thought of as defining the direction and momentum of the line.`;
});

addCanvas(2, (ctx, width, height, animate) => {
    const period = Math.PI * Math.E * 1000;
    const start = point(width * 0.3, height * 0.8, 0, 0, -105, width * 0.32);
    const end = point(width * 0.7, height * 0.8, -75, width * 0.25, 0, 0);

    animate((frameTime) => {
        const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);
        const d = calcFullDetails(percentage, start, end);

        tempStyles(
            ctx,
            () => {
                ctx.fillStyle = colors.secondary;
                ctx.strokeStyle = colors.secondary;
            },
            () => {
                drawLine(ctx, d.a0, d.a1, 1);
                drawLine(ctx, d.a1, d.a2, 1);
                drawLine(ctx, d.a2, d.a3, 1);
                drawLine(ctx, d.b0, d.b1, 1);
                drawLine(ctx, d.b1, d.b2, 1);
                drawLine(ctx, d.c0, d.c1, 1);

                drawPoint(ctx, d.a0, 1.3, "a0");
                drawPoint(ctx, d.a1, 1.3, "a1");
                drawPoint(ctx, d.a2, 1.3, "a2");
                drawPoint(ctx, d.a3, 1.3, "a3");
                drawPoint(ctx, d.b0, 1.3, "b0");
                drawPoint(ctx, d.b1, 1.3, "b1");
                drawPoint(ctx, d.b2, 1.3, "b2");
                drawPoint(ctx, d.c0, 1.3, "c0");
                drawPoint(ctx, d.c1, 1.3, "c1");
            },
        );

        tempStyles(
            ctx,
            () => (ctx.fillStyle = colors.highlight),
            () => drawPoint(ctx, d.d0, 3),
        );

        drawOpen(ctx, start, end, false);
    });

    return `The curve can be drawn geometrically by recursively splitting points by a percentage
        until there is only one point remaining. Note there is no constant relationship between the
        percentage that "drew" the point and the arc lengths before/after it. Uniform motion must be
        approximated instead.`;
});

addTitle(4, "How are blobs made?");

addCanvas(
    1.3,
    (ctx, width, height) => {
        const center: Coord = {x: width * 0.5, y: height * 0.5};
        const radius = width * 0.3;
        const points = 5;
        const shape = makePoly(points, radius, center);

        // Draw lines from center to each point..
        tempStyles(
            ctx,
            () => {
                ctx.fillStyle = colors.secondary;
                ctx.strokeStyle = colors.secondary;
            },
            () => {
                drawPoint(ctx, center, 2);
                forPoints(shape, ({curr}) => {
                    drawLine(ctx, center, curr, 1, 2);
                });
            },
        );

        drawClosed(ctx, shape, false);

        return `Initial points are rotated evenly around the center.`;
    },
    (ctx, width, height, animate) => {
        const period = Math.PI * 1000;
        const center: Coord = {x: width * 0.5, y: height * 0.5};
        const radius = width * 0.3;
        const points = 5;
        const randSeed = "abcd";
        const randStrength = 0.5;

        const shape = makePoly(points, radius, center);

        animate((frameTime) => {
            const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);
            const rgen = rand(randSeed);

            // Draw original shape.
            tempStyles(
                ctx,
                () => {
                    ctx.fillStyle = colors.secondary;
                    ctx.strokeStyle = colors.secondary;
                },
                () => {
                    drawPoint(ctx, center, 2);
                    forPoints(shape, ({curr, next}) => {
                        drawLine(ctx, curr, next(), 1, 2);
                    });
                },
            );

            // Draw randomly shifted shape.
            const shiftedShape = shape.map(
                (p): Point => {
                    const randOffset = percentage * (randStrength * rgen() - randStrength / 2);
                    return coordPoint(splitLine(randOffset, p, center));
                },
            );

            drawClosed(ctx, shiftedShape, true);
        });

        return `Each point is randomly moved towards or away from the center.`;
    },
);

addCanvas(
    1.3,
    (ctx, width, height) => {
        const options: BlobOptions = {
            extraPoints: 2,
            randomness: 6,
            seed: "random",
            size: width * 0.7,
        };
        const center: Coord = {x: width * 0.5, y: height * 0.5};

        const polyBlob = centeredBlob(options, center).map(coordPoint);

        // Draw polygon blob.
        tempStyles(
            ctx,
            () => {
                ctx.fillStyle = colors.secondary;
                ctx.strokeStyle = colors.secondary;
            },
            () => {
                drawPoint(ctx, center, 2);
                forPoints(polyBlob, ({curr}) => {
                    drawLine(ctx, center, curr, 1, 2);
                });
            },
        );

        drawClosed(ctx, polyBlob, false);

        return `In this state, the points have handles with zero length and angle.`;
    },
    (ctx, width, height, animate) => {
        const period = Math.PI * 1000;
        const options: BlobOptions = {
            extraPoints: 2,
            randomness: 6,
            seed: "random",
            size: width * 0.7,
        };
        const center: Coord = {x: width * 0.5, y: height * 0.5};

        const blob = centeredBlob(options, center);

        animate((frameTime) => {
            const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);

            // Draw original blob.
            tempStyles(
                ctx,
                () => {
                    ctx.fillStyle = colors.secondary;
                    ctx.strokeStyle = colors.secondary;
                },
                () => {
                    drawPoint(ctx, center, 2);
                    forPoints(blob, ({curr, next}) => {
                        drawLine(ctx, curr, next(), 1, 2);
                    });
                },
            );

            // Draw animated blob.
            const animatedBlob = mapPoints(blob, ({curr}) => {
                curr.handleIn.length *= percentage;
                curr.handleOut.length *= percentage;
                return curr;
            });

            drawClosed(ctx, animatedBlob, true);
        });

        return `The blob is smoothed by making handles parallel to the line between the points
            immediately before and after. The length of the handles is a function of the distance to
            the nearest neighbor.`;
    },
);

addTitle(4, "How are animated blobs interpolated?");

addCanvas(2, (ctx, width, height, animate) => {
    const period = Math.PI * 1000;
    const center: Coord = {x: width * 0.5, y: height * 0.5};
    const fadeSpeed = 10;
    const fadeLead = 0.05;
    const fadeFloor = 0.2;

    const blobA = centeredBlob(
        {
            extraPoints: 3,
            randomness: 6,
            seed: "12345",
            size: height * 0.8,
        },
        center,
    );
    const blobB = centeredBlob(
        {
            extraPoints: 3,
            randomness: 6,
            seed: "abc",
            size: height * 0.8,
        },
        center,
    );

    animate((frameTime) => {
        const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);

        const shiftedFrameTime = frameTime + period * fadeLead;
        const shiftedPercentage = calcBouncePercentage(
            period,
            timingFunctions.ease,
            shiftedFrameTime,
        );
        const shiftedPeriodPercentage = mod(shiftedFrameTime, period) / period;

        forceStyles(ctx, () => {
            const {pt} = sizes();
            ctx.fillStyle = "transparent";
            ctx.lineWidth = pt;
            ctx.strokeStyle = colors.secondary;
            ctx.setLineDash([2 * pt]);

            if (shiftedPeriodPercentage > 0.5) {
                ctx.globalAlpha = fadeFloor + fadeSpeed * (1 - shiftedPercentage);
                drawClosed(ctx, blobA, false);

                ctx.globalAlpha = fadeFloor;
                drawClosed(ctx, blobB, false);
            } else {
                ctx.globalAlpha = fadeFloor + fadeSpeed * shiftedPercentage;
                drawClosed(ctx, blobB, false);

                ctx.globalAlpha = fadeFloor;
                drawClosed(ctx, blobA, false);
            }
        });

        drawClosed(ctx, interpolateBetween(percentage, blobA, blobB), true);
    });

    // TODO have content about why being able to interrupt transitions with another.
    return `Interpolation requires points to be paired up from shape A to B. This means both blobs
        must have the same number of points and that the points should be matched in a way that
        minimizes movement.`;
});

addCanvas(
    1.3,
    (ctx, width, height, animate) => {
        const period = Math.PI ** Math.E * 1000;
        const center: Coord = {x: width * 0.5, y: height * 0.5};

        const blob = centeredBlob(
            {
                extraPoints: 3,
                randomness: 6,
                seed: "shift",
                size: height * 0.9,
            },
            center,
        );

        animate((frameTime) => {
            const animationTime = mod(frameTime, period);
            const totalShifts = blob.length;
            const localPeriod = period / totalShifts;

            const shiftNumber = Math.floor((animationTime / period) * totalShifts);
            const localPercentage = timingFunctions.ease(
                mod(animationTime, localPeriod) / localPeriod,
            );

            const prevBlob = shift(shiftNumber - 1, blob);
            const currentBlob = shift(shiftNumber, blob);

            // Draw lines points are travelling.
            tempStyles(
                ctx,
                () => {
                    ctx.fillStyle = colors.secondary;
                    ctx.strokeStyle = colors.secondary;
                },
                () => {
                    drawPoint(ctx, center, 2);
                    forPoints(blob, ({curr, next}) => {
                        drawLine(ctx, curr, next(), 1, 2);
                    });
                },
            );

            drawClosed(
                ctx,
                interpolateBetweenSmooth(2, localPercentage, prevBlob, currentBlob),
                true,
            );
        });

        return `Points cannot be swapped without resulting in a different shape. However, a likely
            enough optimal order can be selected by shifting the points and comparing the point
            position deltas.`;
    },
    (ctx, width, height, animate) => {
        const period = Math.PI * Math.E * 1000;
        const center: Coord = {x: width * 0.5, y: height * 0.5};

        const blob = centeredBlob(
            {
                extraPoints: 3,
                randomness: 6,
                seed: "flip",
                size: height * 0.9,
            },
            center,
        );
        const reversedBlob = mapPoints(blob, ({curr}) => {
            const temp = curr.handleIn;
            curr.handleIn = curr.handleOut;
            curr.handleOut = temp;
            return curr;
        });
        reversedBlob.reverse();

        animate((frameTime) => {
            const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);

            forceStyles(ctx, () => {
                const {pt} = sizes();
                ctx.fillStyle = "transparent";
                ctx.lineWidth = pt;
                ctx.strokeStyle = colors.secondary;
                ctx.setLineDash([2 * pt]);
                drawClosed(ctx, blob, false);
            });

            drawClosed(ctx, interpolateBetweenSmooth(2, percentage, blob, reversedBlob), true);
        });

        return `The only safe re-ordering is to reverse the points and again iterate through all
            possible shifts.`;
    },
);

addCanvas(
    1.3,
    (ctx, width, height, animate) => {
        const period = Math.PI * 1000;
        const center: Coord = {x: width * 0.5, y: height * 0.5};
        const maxExtraPoints = 4;
        const {pt} = sizes();

        const blob = centeredBlob(
            {
                extraPoints: 0,
                randomness: 6,
                seed: "flip",
                size: height * 0.9,
            },
            center,
        );

        animate((frameTime) => {
            const percentage = mod(frameTime, period) / period;
            const extraPoints = Math.floor(percentage * (maxExtraPoints + 1));
            drawClosed(ctx, divide(extraPoints + blob.length, blob), true);

            forPoints(blob, ({curr}) => {
                ctx.beginPath();
                ctx.arc(curr.x, curr.y, pt * 6, 0, 2 * Math.PI);

                tempStyles(
                    ctx,
                    () => {
                        ctx.strokeStyle = colors.secondary;
                        ctx.lineWidth = pt;
                    },
                    () => {
                        ctx.stroke();
                    },
                );
            });
        });

        return `Points are added until they both have the same count. These new points should be as
            evenly distributed as possible. It is almost never possible to be able to remove points
            from a shape without changing it.`;
    },
    (ctx, width, height, animate) => {
        const period = Math.PI ** Math.E * 1000;
        const start = point(width * 0.1, height * 0.6, 0, 0, -45, width * 0.5);
        const end = point(width * 0.9, height * 0.6, 160, width * 0.3, 0, 0);

        animate((frameTime) => {
            const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);
            const d = calcFullDetails(percentage, start, end);

            tempStyles(
                ctx,
                () => {
                    ctx.fillStyle = colors.secondary;
                    ctx.strokeStyle = colors.secondary;
                },
                () => {
                    drawLine(ctx, d.a0, d.a1, 1);
                    drawLine(ctx, d.a1, d.a2, 1);
                    drawLine(ctx, d.a2, d.a3, 1);
                    drawLine(ctx, d.b0, d.b1, 1);
                    drawLine(ctx, d.b1, d.b2, 1);

                    drawPoint(ctx, d.a0, 1.3);
                    drawPoint(ctx, d.a1, 1.3);
                    drawPoint(ctx, d.a2, 1.3);
                    drawPoint(ctx, d.a3, 1.3);
                    drawPoint(ctx, d.b0, 1.3);
                    drawPoint(ctx, d.b1, 1.3);
                    drawPoint(ctx, d.b2, 1.3);
                },
            );

            forceStyles(ctx, () => {
                const {pt} = sizes();
                ctx.fillStyle = colors.secondary;
                ctx.strokeStyle = colors.secondary;
                ctx.lineWidth = pt;

                drawOpen(ctx, start, end, false);
            });

            tempStyles(
                ctx,
                () => {
                    ctx.fillStyle = colors.highlight;
                    ctx.strokeStyle = colors.highlight;
                },
                () => {
                    drawLine(ctx, d.c0, d.c1, 1);
                    drawPoint(ctx, d.c0, 1.3);
                    drawPoint(ctx, d.c1, 1.3);
                },
            );

            tempStyles(
                ctx,
                () => (ctx.fillStyle = colors.highlight),
                () => drawPoint(ctx, d.d0, 2),
            );
        });

        return `Curve splitting uses the innermost line from the cubic bezier curve drawing demo and
            makes either side of the final point the handles.`;
    },
);
