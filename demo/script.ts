import {debugColor} from "./debug";
import {newRow, CellPainter} from "./painter";

// content
//     raster vs pixel
//     bezier curves
//         demo
//         how to drawn
//     shape smoothing
//         handle angle
//         handle length
//     shape morphing
//         path splitting

const tempStyles = (ctx: CanvasRenderingContext2D, fn: () => void) => {
    const backup: Partial<CanvasRenderingContext2D> = {
        strokeStyle: ctx.strokeStyle,
        fillStyle: ctx.fillStyle,
    };
    fn();
    Object.assign(ctx, backup);
};

const rotateAround = (
    options: {ctx: CanvasRenderingContext2D; angle: number; cx: number; cy: number},
    fn: () => void,
) => {
    options.ctx.translate(options.cx, options.cy);
    options.ctx.rotate(options.angle);
    tempStyles(options.ctx, () => {
        options.ctx.fillStyle = debugColor;
        options.ctx.fillRect(-3, -3, 6, 6);
        options.ctx.fillRect(-32, -1, 64, 2);
    });
    fn();
    options.ctx.setTransform(1, 0, 0, 1, 0, 0);
};

const gridPainter = (slices: number, color: string): CellPainter => {
    return (ctx, width, height) => {
        const w = width / slices;
        const h = height / slices;
        for (let i = 0; i < slices; i++) {
            for (let j = 0; j < slices; j++) {
                if ((i + j) % 2 == 0) {
                    ctx.fillStyle = color;
                    ctx.fillRect(i * w, j * h, w, h);
                }
            }
        }
    };
};

const textPainter = (text: string, angle: number): CellPainter => {
    return (ctx, width, height) => {
        const fontSize = width * 0.04;
        const lineHeight = fontSize * 1.3;
        ctx.font = `${fontSize}px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif`;

        // Break up text into lines.
        const lines: string[] = [];
        const lineWidth = width * 0.8;
        const words = text.trim().split(" ");
        let currentLine = "";
        while (words.length > 0) {
            const {width} = ctx.measureText(currentLine + " " + words[0]);
            if (width < lineWidth) {
                currentLine += words[0] + " ";
            } else {
                lines.push(currentLine);
                currentLine = words[0];
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
                ctx.fillText(lines[i], -x, -y + lineHeight * (i + 1));
            }
        });
    };
};

newRow(
    2,
    textPainter(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        Math.PI / 64,
    ),
);

newRow(
    1,
    // Pixelated circle.
    (ctx, width, height) => {
        const angle = Math.PI / 16;
        const pt = width * 0.04;
        const quadrant = [0, 1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 9, 9, 9];
        const cx = width / 2;
        const cy = height / 2;

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
        const pt = width * 0.04;
        const shapeSize = width * 0.8;
        const cx = width / 2;
        const cy = height / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, shapeSize / 2, 0, 2 * Math.PI);
        ctx.lineWidth = pt;
        ctx.strokeStyle = "#ec576b";
        ctx.stroke();
    },
);

newRow(2, gridPainter(4, "#ec576b"), gridPainter(80, "#ec576b"));
newRow(2, gridPainter(16, "#ec576b"));
