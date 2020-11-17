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

    // Draw text.
    const fontSize = size * 0.04;
    const lineHeight = 1.3 * fontSize;
    const startY = size * 0.2;
    const startX = size * 0.2;
    ctx.rotate(Math.PI / 64);
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif`;
    ctx.fillText("Lorem ipsum, this is the text I'm going to", startX, startY);
    ctx.fillText("be putting on the screen, don't mind me,", startX, startY + lineHeight);
    ctx.fillText("just making it really long.", startX, startY + 2 * lineHeight);
});

newSlide(gridPainter(8, "#ec576b", "white"));
newSlide(gridPainter(80, "#ec576b", "white"));
newSlide(gridPainter(16, "#ec576b", "white"));
