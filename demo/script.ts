import {newSlide} from "./slides";

for (let i = 0; i < 6; i++) {
    const {canvas, ctx} = newSlide();
    if (i % 2 == 0) {
        ctx.fillStyle = "#e4e4e4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
