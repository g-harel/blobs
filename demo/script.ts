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

newSlide(gridPainter(8, "red", "white"));
newSlide(gridPainter(80, "blue", "white"));
newSlide(gridPainter(16, "grey", "white"));
