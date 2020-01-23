import {Coord, Point} from "./types";
import {expandHandle} from "./util";

const pointSize = 2;
const infoSpacing = 20;

let ctx: CanvasRenderingContext2D;
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const temp = canvas.getContext("2d");
if (temp === null) throw new Error("context is null");
ctx = temp;

export const canvasClear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const canvasSize = (width: number, height: number) => {
    canvas.height = height;
    canvas.width = width;
};

const drawLine = (a: Coord, b: Coord, style: string) => {
    const backupStrokeStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = style;
    ctx.stroke();
    ctx.strokeStyle = backupStrokeStyle;
};

const drawPoint = (p: Coord, style: string) => {
    const backupFillStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pointSize, 0, 2 * Math.PI);
    ctx.fillStyle = style;
    ctx.fill();
    ctx.fillStyle = backupFillStyle;
};

export const drawInfo = (() => {
    let count = 1;
    const positions: Record<string, any> = {};
    return (label: string, value: any) => {
        if (!positions[label]) {
            positions[label] = count;
            count++;
        }
        ctx.fillText(`${label}: ${value}`, infoSpacing, positions[label] * infoSpacing);
    };
})();

export const drawShape = (debug: boolean, points: Point[]) => {
    if (points.length < 2) throw new Error("not enough points");

    // Draw points.
    for (let i = 0; i < points.length; i++) {
        // Compute coordinates of handles.
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const currHandle = expandHandle(curr, curr.handleOut);
        const nextHandle = expandHandle(next, next.handleIn);

        if (debug) {
            drawPoint(curr, "");
            drawLine(curr, currHandle, "#ccc");
            drawLine(next, nextHandle, "#b6b");
        }

        // Draw curve between curr and next points.
        ctx.beginPath();
        ctx.moveTo(curr.x, curr.y);
        ctx.bezierCurveTo(currHandle.x, currHandle.y, nextHandle.x, nextHandle.y, next.x, next.y);
        ctx.stroke();
    }
};
