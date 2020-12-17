import {TimingFunc} from "../../internal/animate/timing";
import {Coord, Point} from "../../internal/types";
import {expandHandle, forPoints, mod, rad} from "../../internal/util";
import {debug, debugColor} from "../internal/debug";
import {getTotalWidth, highlightColor} from "../internal/layout";

export const tempStyles = (ctx: CanvasRenderingContext2D, fn: () => void) => {
    ctx.save();
    fn();
    ctx.restore();
};

export const rotateAround = (
    options: {ctx: CanvasRenderingContext2D; angle: number; cx: number; cy: number},
    fn: () => void,
) => {
    tempStyles(options.ctx, () => {
        options.ctx.translate(options.cx, options.cy);
        options.ctx.rotate(options.angle);
        if (debug) {
            tempStyles(options.ctx, () => {
                options.ctx.fillStyle = debugColor;
                options.ctx.fillRect(0, -4, 1, 8);
                options.ctx.fillRect(-32, 0, 64, 1);
            });
        }
        fn();
    });
};

export const point = (
    x: number,
    y: number,
    ia: number,
    il: number,
    oa: number,
    ol: number,
): Point => {
    return {
        x: x,
        y: y,
        handleIn: {angle: rad(ia), length: il},
        handleOut: {angle: rad(oa), length: ol},
    };
};

// TODO optional label.
export const drawPoint = (ctx: CanvasRenderingContext2D, coord: Coord, width: number) => {
    const pointPath = new Path2D();
    pointPath.arc(coord.x, coord.y, width, 0, 2 * Math.PI);
    ctx.fill(pointPath);
};

export const drawLine = (
    ctx: CanvasRenderingContext2D,
    a: Coord,
    b: Coord,
    width: number,
    dash?: number,
) => {
    tempStyles(ctx, () => {
        const linePath = new Path2D();
        linePath.moveTo(a.x, a.y);
        linePath.lineTo(b.x, b.y);
        if (dash) ctx.setLineDash([dash]);
        ctx.lineWidth = width;
        ctx.stroke(linePath);
    });
};

export const drawClosed = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    forPoints(points, ({curr, next}) => {
        drawOpen(ctx, curr, next());
    });
};

export const drawOpen = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const width = getTotalWidth();
    const startHandle = expandHandle(start, start.handleOut);
    const endHandle = expandHandle(end, end.handleIn);

    // Draw handles.
    tempStyles(ctx, () => {
        const lineWidth = width * 0.002;

        drawLine(ctx, start, startHandle, lineWidth);
        drawLine(ctx, end, endHandle, lineWidth, lineWidth * 2);

        drawPoint(ctx, startHandle, lineWidth * 1.4);
        drawPoint(ctx, endHandle, lineWidth * 1.4);
    });

    // Draw curve.
    tempStyles(ctx, () => {
        const lineWidth = width * 0.003;
        ctx.lineWidth = lineWidth;

        const curve = new Path2D();
        curve.moveTo(start.x, start.y);
        curve.bezierCurveTo(startHandle.x, startHandle.y, endHandle.x, endHandle.y, end.x, end.y);

        tempStyles(ctx, () => {
            ctx.strokeStyle = highlightColor;
            ctx.stroke(curve);
        });

        tempStyles(ctx, () => {
            ctx.fillStyle = highlightColor;
            drawPoint(ctx, start, lineWidth * 2);
            drawPoint(ctx, end, lineWidth * 2);
        });
    });
};

export const calcBouncePercentage = (period: number, timingFunc: TimingFunc, frameTime: number) => {
    const halfPeriod = period / 2;
    const animationTime = mod(frameTime, period);
    if (animationTime <= halfPeriod) {
        return timingFunc(animationTime / halfPeriod);
    } else {
        return timingFunc(1 - (animationTime - halfPeriod) / halfPeriod);
    }
};
