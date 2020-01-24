import {Coord, Point} from "../types";
import {expandHandle} from "../util";

const pointSize = 2;
const infoSpacing = 20;

export function clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function drawInfo(ctx: CanvasRenderingContext2D, pos: number, label: string, value: any) {
    ctx.fillText(`${label}: ${value}`, infoSpacing, (pos + 1) * infoSpacing);
}

function drawLine(ctx: CanvasRenderingContext2D, a: Coord, b: Coord, style: string) {
    const backupStrokeStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = style;
    ctx.stroke();
    ctx.strokeStyle = backupStrokeStyle;
}

function drawPoint(ctx: CanvasRenderingContext2D, p: Coord, style: string) {
    const backupFillStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pointSize, 0, 2 * Math.PI);
    ctx.fillStyle = style;
    ctx.fill();
    ctx.fillStyle = backupFillStyle;
}

export function drawShape(ctx: CanvasRenderingContext2D, debug: boolean, points: Point[]) {
    if (points.length < 2) throw new Error("not enough points");

    for (let i = 0; i < points.length; i++) {
        // Compute coordinates of handles.
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const currHandle = expandHandle(curr, curr.handleOut);
        const nextHandle = expandHandle(next, next.handleIn);

        if (debug) {
            drawPoint(ctx, curr, "");
            drawLine(ctx, curr, currHandle, "#ccc");
            drawLine(ctx, next, nextHandle, "#b6b");
        }

        // Draw curve between curr and next points.
        ctx.beginPath();
        ctx.moveTo(curr.x, curr.y);
        ctx.bezierCurveTo(currHandle.x, currHandle.y, nextHandle.x, nextHandle.y, next.x, next.y);
        ctx.stroke();
    }
}
