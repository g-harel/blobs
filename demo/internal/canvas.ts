import {Point} from "../../internal/types";
import {expandHandle, forPoints, rad} from "../../internal/util";
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
        ctx.lineWidth = lineWidth;

        const startHandleLine = new Path2D();
        startHandleLine.moveTo(start.x, start.y);
        startHandleLine.lineTo(startHandle.x, startHandle.y);
        ctx.stroke(startHandleLine);

        const startHandlePoint = new Path2D();
        startHandlePoint.arc(startHandle.x, startHandle.y, lineWidth * 1.4, 0, 2 * Math.PI);
        ctx.fill(startHandlePoint);

        const endHandleLine = new Path2D();
        endHandleLine.moveTo(end.x, end.y);
        endHandleLine.lineTo(endHandle.x, endHandle.y);
        ctx.setLineDash([lineWidth * 2]);
        ctx.stroke(endHandleLine);

        const endHandlePoint = new Path2D();
        endHandlePoint.arc(endHandle.x, endHandle.y, lineWidth * 1.4, 0, 2 * Math.PI);
        ctx.fill(endHandlePoint);
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

        const startPoint = new Path2D();
        startPoint.arc(start.x, start.y, lineWidth * 2, 0, 2 * Math.PI);
        const endPoint = new Path2D();
        endPoint.arc(end.x, end.y, lineWidth * 2, 0, 2 * Math.PI);

        tempStyles(ctx, () => {
            ctx.fillStyle = highlightColor;
            ctx.fill(startPoint);
            ctx.fill(endPoint);
        });
    });
};
