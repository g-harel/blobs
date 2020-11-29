import {Point} from "../internal/types";
import {expandHandle, forPoints, rad} from "../internal/util";
import {debug, debugColor} from "./debug";
import {addCanvasRow, addTextRow, CellPainter, getTotalWidth} from "./layout";

const highlightColor = "#ec576b";

const tempStyles = (ctx: CanvasRenderingContext2D, fn: () => void) => {
    ctx.save();
    fn();
    ctx.restore();
};

const rotateAround = (
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

const point = (x: number, y: number, ia: number, il: number, oa: number, ol: number): Point => {
    return {
        x: x,
        y: y,
        handleIn: {angle: rad(ia), length: il},
        handleOut: {angle: rad(oa), length: ol},
    };
};

const textPainter = (text: string, angle: number): CellPainter => {
    return (ctx, width, height) => {
        const fontSize = width * 0.04;
        const lineHeight = fontSize * 1.3;
        ctx.font = `${fontSize}px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif`;

        text = text.replace("\n", " ").replace(/\s+/g, " ").trim();

        // Break up text into lines.
        const lines: string[] = [];
        const lineWidth = width * 0.8;
        const words = text.split(" ");
        let currentLine = "";
        while (words.length > 0) {
            const {width} = ctx.measureText(currentLine + " " + words[0]);
            if (width < lineWidth) {
                currentLine += words[0] + " ";
            } else {
                lines.push(currentLine);
                currentLine = words[0] + " ";
            }
            words.shift();
        }
        lines.push(currentLine);

        // Draw lines.
        const cx = width / 2;
        const cy = height / 2;
        rotateAround({ctx, cx, cy, angle}, () => {
            const x = lineWidth / 2;
            const y = (lineHeight * lines.length) / 2;
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], -x, -y + lineHeight * (i + 0.75));
            }
        });
    };
};

// TODO style
// TODO replace current text rows
// TODO implement title styles
addTextRow(false, "test");

addCanvasRow(
    2.6,
    textPainter(
        `Raster images (left) are made up of pixels and have a fixed
        resolution. Vector formats (right) instead use math equations to draw
        the image at any scale. This makes it ideal for artwork that has sharp
        lines and will be viewed at varying sizes like logos and fonts.`,
        Math.PI / 64,
    ),
);

addCanvasRow(
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
                ctx.fillStyle = "#ec576b";
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
        ctx.strokeStyle = "#ec576b";
        ctx.stroke();
    },
);

addCanvasRow(
    3.6,
    textPainter(
        `A common way to define these vector shapes is using Bezier curves.
        These curves are made up of two point coordinates, and handle
        coordinates. The handles define the direction and momentum of the line.`,
        -Math.PI / 128,
    ),
);

addCanvasRow(2, (ctx, width, height) => {
    const start = point(width * 0.2, height * 0.5, 0, 0, -45, width * 0.25);
    const end = point(width * 0.8, height * 0.5, 135, width * 0.25, 0, 0);
    drawCurve(ctx, start, end);

    drawClosed(ctx, [
        point(200, 400, 90, 200, -90, 100),
        point(400, 200, 135, 200, -45, 100),
        point(400, 400, 0, 200, 180, 100),
    ]);
});

const drawClosed = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    forPoints(points, ({curr, next}) => {
        drawCurve(ctx, curr, next());
    });
};

const drawCurve = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
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
