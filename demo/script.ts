import {newSlide, SlidePainter} from "./slides";

// slides
//     raster vs pixel
//     bezier curves
//         demo
//         how to drawn
//     shape smoothing
//         handle angle
//         handle length
//     shape morphing
//         path splitting

const gridPainter = (slices: number, a: string, b: string): SlidePainter => {
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

newSlide((ctx, size) => {
    // Draw pixelated circle.
    const posX = size * 0.05;
    const posY = size * 0.5;
    const shapeSize = size * 0.4;
    const cx = posX + shapeSize / 2;
    const cy = posY + shapeSize / 2;
    const quadrant = [0, 1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 9, 9, 9];
    const gridCount = 2 * quadrant.length;
    const pixels = shapeSize / gridCount;
    for (let i = 0; i < quadrant.length; i++) {
        const gridX = quadrant[i];
        const gridY = quadrant[quadrant.length - 1 - i];
        ctx.fillRect(cx + gridX * pixels, cy + gridY * pixels, pixels + 1, pixels + 1);
        ctx.fillRect(cx - (gridX + 1) * pixels, cy + gridY * pixels, pixels + 1, pixels + 1);
        ctx.fillRect(cx + gridX * pixels, cy - (gridY + 1) * pixels, pixels + 1, pixels + 1);
        ctx.fillRect(cx - (gridX + 1) * pixels, cy - (gridY + 1) * pixels, pixels + 1, pixels + 1);
    }

    // Draw smooth circle.
    ctx.beginPath();
    ctx.arc(size * 0.7, posY + shapeSize / 2, shapeSize / 3, 0, 2 * Math.PI);
    ctx.lineWidth = pixels;
    ctx.strokeStyle = "black";
    ctx.stroke();
});

newSlide(gridPainter(8, "red", "white"));
newSlide(gridPainter(80, "blue", "white"));
newSlide(gridPainter(16, "grey", "white"));
