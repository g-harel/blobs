import {Coord, Shape} from "../types";
import {expandHandle, mod} from "../util";

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

// OPT draw cutout
export const drawShape = (ctx: CanvasRenderingContext2D, debug: boolean, shape: Shape) => {
    if (shape.length < 2) throw new Error("not enough points");

    for (let i = 0; i < shape.length; i++) {
        // Compute coordinates of handles.
        const curr = shape[i];
        const next = shape[mod(i + 1, shape.length)];
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
};
