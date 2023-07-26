import {TimingFunc} from "../../internal/animate/timing";
import {Coord, Point} from "../../internal/types";
import {expandHandle, forPoints, mod, rad} from "../../internal/util";
import {isDebug} from "../internal/debug";
import {sizes, colors} from "../internal/layout";

export const forceStyles = (ctx: CanvasRenderingContext2D, fn: () => void) => {
    if (!(ctx as any).forcedStyles) (ctx as any).forcedStyles = 0;
    (ctx as any).forcedStyles++;
    ctx.save();
    fn();
    ctx.restore();
    (ctx as any).forcedStyles--;
};

export const tempStyles = (ctx: CanvasRenderingContext2D, style: () => void, fn: () => void) => {
    if ((ctx as any).forcedStyles > 0) {
        fn();
    } else {
        ctx.save();
        style();
        fn();
        ctx.restore();
    }
};

export const rotateAround = (
    options: {ctx: CanvasRenderingContext2D; angle: number; cx: number; cy: number},
    fn: () => void,
) => {
    tempStyles(
        options.ctx,
        () => {
            options.ctx.translate(options.cx, options.cy);
            options.ctx.rotate(options.angle);
        },
        () => {
            if (isDebug()) {
                tempStyles(
                    options.ctx,
                    () => (options.ctx.fillStyle = colors.debug),
                    () => {
                        options.ctx.fillRect(0, -4, 1, 8);
                        options.ctx.fillRect(-32, 0, 64, 1);
                    },
                );
            }
            fn();
        },
    );
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

export const drawPoint = (
    ctx: CanvasRenderingContext2D,
    coord: Coord,
    size: number,
    label?: string,
) => {
    const radius = sizes().pt * size;
    const pointPath = new Path2D();
    pointPath.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
    ctx.fill(pointPath);

    if (label) {
        tempStyles(
            ctx,
            () => (ctx.font = `${6 * radius}px monospace`),
            () => ctx.fillText(label, coord.x + 2 * radius, coord.y - radius),
        );
    }
};

export const drawLine = (
    ctx: CanvasRenderingContext2D,
    a: Coord,
    b: Coord,
    size: number,
    dash?: number,
) => {
    tempStyles(
        ctx,
        () => {
            const width = sizes().pt * size;
            if (dash) ctx.setLineDash([dash * width]);
        },
        () => {
            const width = sizes().pt * size;
            const linePath = new Path2D();
            linePath.moveTo(a.x, a.y);
            linePath.lineTo(b.x, b.y);
            ctx.lineWidth = width;
            ctx.stroke(linePath);
        },
    );
};

export const drawClosed = (ctx: CanvasRenderingContext2D, points: Point[], handles?: boolean) => {
    forPoints(points, ({curr, next}) => {
        drawOpen(ctx, curr, next(), handles);
    });
};

export const drawDebugClosed = (ctx: CanvasRenderingContext2D, points: Point[], size: number) => {
    forPoints(points, ({curr, next: nextFn}) => {
        const next = nextFn();
        const currHandle = expandHandle(curr, curr.handleOut);
        const nextHandle = expandHandle(next, next.handleIn);
    
        drawLine(ctx, curr, currHandle, size);
        drawLine(ctx, next, nextHandle, size, 2);
        drawPoint(ctx, currHandle, size * 1.4);
        drawPoint(ctx, nextHandle, size * 1.4);
        const curve = new Path2D();
        curve.moveTo(curr.x, curr.y);
        curve.bezierCurveTo(
            currHandle.x,
            currHandle.y,
            nextHandle.x,
            nextHandle.y,
            next.x,
            next.y,
        );
        ctx.lineWidth = sizes().pt * size*2;
        ctx.stroke(curve);
        drawPoint(ctx, curr, size * 1.1);
        drawPoint(ctx, next, size * 1.1);
    });
}

export const drawOpen = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    handles?: boolean,
) => {
    const width = sizes().width;
    const startHandle = expandHandle(start, start.handleOut);
    const endHandle = expandHandle(end, end.handleIn);

    // Draw handles.
    if (handles) {
        tempStyles(
            ctx,
            () => {
                ctx.fillStyle = colors.secondary;
                ctx.strokeStyle = colors.secondary;
            },
            () => {
                drawLine(ctx, start, startHandle, 1);
                drawLine(ctx, end, endHandle, 1, 2);

                drawPoint(ctx, startHandle, 1.4);
                drawPoint(ctx, endHandle, 1.4);
            },
        );
    }

    // Draw curve.
    tempStyles(
        ctx,
        () => {
            const lineWidth = width * 0.003;
            ctx.lineWidth = lineWidth;
        },
        () => {
            const curve = new Path2D();
            curve.moveTo(start.x, start.y);
            curve.bezierCurveTo(
                startHandle.x,
                startHandle.y,
                endHandle.x,
                endHandle.y,
                end.x,
                end.y,
            );

            tempStyles(
                ctx,
                () => (ctx.strokeStyle = colors.highlight),
                () => ctx.stroke(curve),
            );

            tempStyles(
                ctx,
                () => (ctx.fillStyle = colors.highlight),
                () => {
                    drawPoint(ctx, start, 2);
                    drawPoint(ctx, end, 2);
                },
            );
        },
    );
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
