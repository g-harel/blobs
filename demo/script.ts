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

const gridPainter = (slices: number, a: string, b: string): CellPainter => {
    return (ctx, size) => {
        const s = size / slices;
        for (let i = 0; i < slices; i++) {
            for (let j = 0; j < slices; j++) {
                if ((i + j) % 2 == 0) {
                    ctx.fillStyle = a;
                } else {
                    ctx.fillStyle = b;
                }
                ctx.fillRect(i * s, j * s, (i + 1) * s, (j + 1) * s);
            }
        }
    };
};

const paintText = (ctx: CanvasRenderingContext2D, size: number, text: string, angle: number) => {
    const fontSize = size * 0.04;
    const lineHeight = fontSize * 1.3;
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif`;

    const lines: string[] = [];
    const lineWidth = size * 0.8;
    const words = text.split(" ");
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

    const startY = size * 0.1;
    const startX = size * 0.15;
    ctx.rotate(angle);
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], startX, startY + lineHeight * i);
    }
};

newRow((ctx, size) => {
    // Draw pixelated circle.
    const posX = size * 0.25;
    const posY = size * 0.45;
    const shapeSize = size * 0.4;
    const cx = posX + shapeSize / 2;
    const cy = posY + shapeSize / 2;
    const quadrant = [0, 1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 9, 9, 9];
    const gridCount = 2 * quadrant.length;
    const pixels = shapeSize / gridCount;
    ctx.rotate(Math.PI / 16);
    for (let i = 0; i < quadrant.length; i++) {
        const gridX = quadrant[i];
        const gridY = quadrant[quadrant.length - 1 - i];
        ctx.fillStyle = "#ec576b";
        ctx.fillRect(cx + gridX * pixels, cy + gridY * pixels, pixels + 1, pixels + 1);
        ctx.fillRect(cx - (gridX + 1) * pixels, cy + gridY * pixels, pixels + 1, pixels + 1);
        ctx.fillRect(cx + gridX * pixels, cy - (gridY + 1) * pixels, pixels + 1, pixels + 1);
        ctx.fillRect(cx - (gridX + 1) * pixels, cy - (gridY + 1) * pixels, pixels + 1, pixels + 1);
    }

    // Reset rotation.
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw smooth circle.
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.65, shapeSize / 3, 0, 2 * Math.PI);
    ctx.lineWidth = pixels;
    ctx.strokeStyle = "#ec576b";
    ctx.stroke();

    paintText(ctx, size, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", Math.PI / 64);
});

newRow(gridPainter(4, "#ec576b", "white"), gridPainter(80, "#ec576b", "white"));
newRow(gridPainter(16, "#ec576b", "white"));
