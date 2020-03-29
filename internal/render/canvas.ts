import {Coord, Point} from "../types";
import {expandHandle, forPoints} from "../util";

const pointSize = 2;
const infoSpacing = 20;

export const clear = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

export const drawInfo = (ctx: CanvasRenderingContext2D, pos: number, label: string, value: any) => {
    ctx.fillText(`${label}: ${value}`, infoSpacing, (pos + 1) * infoSpacing);
};

const drawLine = (ctx: CanvasRenderingContext2D, a: Coord, b: Coord, style: string) => {
    const backupStrokeStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = style;
    ctx.stroke();
    ctx.strokeStyle = backupStrokeStyle;
};

const drawPoint = (ctx: CanvasRenderingContext2D, p: Coord, style: string) => {
    const backupFillStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pointSize, 0, 2 * Math.PI);
    ctx.fillStyle = style;
    ctx.fill();
    ctx.fillStyle = backupFillStyle;
};

export const drawClosed = (ctx: CanvasRenderingContext2D, debug: boolean, points: Point[]) => {
    if (points.length < 2) throw new Error("not enough points");

    // Draw debug points.
    if (debug) {
        forPoints(points, ({curr, next: getNext}) => {
            const next = getNext();

            // Compute coordinates of handles.
            const currHandle = expandHandle(curr, curr.handleOut);
            const nextHandle = expandHandle(next, next.handleIn);

            drawPoint(ctx, curr, "");
            drawLine(ctx, curr, currHandle, "#ccc");
            drawLine(ctx, next, nextHandle, "#b6b");
        });
    }

    ctx.stroke(renderPath2D(points));
};

export const renderPath2D = (points: Point[]): Path2D => {
    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);

    forPoints(points, ({curr, next: getNext}) => {
        const next = getNext();
        const currHandle = expandHandle(curr, curr.handleOut);
        const nextHandle = expandHandle(next, next.handleIn);
        path.bezierCurveTo(currHandle.x, currHandle.y, nextHandle.x, nextHandle.y, next.x, next.y);
    });

    return path;
};
