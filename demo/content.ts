import {addCanvas, addText, highlightColor} from "./internal/layout";
import {rotateAround, point, drawClosed, drawOpen} from "./internal/canvas";
import {mod, split} from "../internal/util";
import {timingFunctions} from "../internal/animate/timing";

// TODO implement title styles
addText(`Raster images (left) are made up of pixels and have a fixed
resolution. Vector formats (right) instead use math equations to draw
the image at any scale. This makes it ideal for artwork that has sharp
lines and will be viewed at varying sizes like logos and fonts.`);

addCanvas(
    1.3,
    // Pixelated circle.
    (ctx, width, height) => {
        const angle = Math.PI / 16;
        const pt = width * 0.03;
        const quadrant = [0, 1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 9, 9, 9];
        const cx = width * 0.55;
        const cy = height * 0.5;

        rotateAround({ctx, cx, cy, angle}, () => {
            for (let i = 0; i < quadrant.length; i++) {
                const gridX = quadrant[i];
                const gridY = quadrant[quadrant.length - 1 - i];
                ctx.fillStyle = highlightColor;
                ctx.fillRect(gridX * pt, gridY * pt, pt + 1, pt + 1);
                ctx.fillRect(-(gridX + 1) * pt, gridY * pt, pt + 1, pt + 1);
                ctx.fillRect(gridX * pt, -(gridY + 1) * pt, pt + 1, pt + 1);
                ctx.fillRect(-(gridX + 1) * pt, -(gridY + 1) * pt, pt + 1, pt + 1);
            }
        });
    },
    // Smooth circle.
    (ctx, width, height) => {
        const pt = width * 0.03;
        const shapeSize = width * 0.6;
        const cx = width * 0.35;
        const cy = height * 0.45;

        ctx.beginPath();
        ctx.arc(cx, cy, shapeSize / 2, 0, 2 * Math.PI);
        ctx.lineWidth = pt;
        ctx.strokeStyle = highlightColor;
        ctx.stroke();
    },
);

addText(
    `A common way to define these vector shapes is using Bezier curves.
        These curves are made up of two point coordinates, and handle
        coordinates. The handles define the direction and momentum of the line.`,
);

addCanvas(2, (ctx, width, height, animate) => {
    const cycleSpeedStart = Math.E * 1000;
    const cycleSpeedEnd = Math.PI * 1000;

    const calcBouncePercentage = (speed: number, frameTime: number) => {
        const halfPeriod = speed / 2;
        const animationTime = mod(frameTime, speed);
        if (animationTime <= halfPeriod) {
            return timingFunctions.ease(animationTime / halfPeriod);
        } else {
            return timingFunctions.ease(1 - (animationTime - halfPeriod) / halfPeriod);
        }
    };

    animate((frameTime) => {
        const startPercentage = calcBouncePercentage(cycleSpeedStart, frameTime);
        const startAngle = split(startPercentage, -45, +45);
        const start = point(width * 0.2, height * 0.5, 0, 0, startAngle, width * 0.25);

        const endPercentage = calcBouncePercentage(cycleSpeedEnd, frameTime);
        const endAngle = split(endPercentage, 135, 225);
        const end = point(width * 0.8, height * 0.5, endAngle, width * 0.25, 0, 0);

        drawOpen(ctx, start, end);
    });
});

// content
//     raster vs pixel-
//     bezier curves
//         demo
//         how to drawn
//     shape smoothing
//         handle angle
//         handle length
//     shape morphing
//         path splitting
