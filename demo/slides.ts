interface Slide {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    painter: SlidePainter;
}

export interface SlidePainter {
    (ctx: CanvasRenderingContext2D, size: number): void;
}

const slides: Slide[] = [];
const slidesContainer = document.querySelector(".slides");
if (!slidesContainer) throw "missing slides container";

// Adds a new slide to the bottom of the stack.
export const newSlide = (painter: SlidePainter) => {
    const canvas = document.createElement("canvas");
    slidesContainer.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw "missing canvas context";

    const slide = {canvas, ctx, painter};
    slides.push(slide);

    redraw();
};

// Lazily redraw canvas to match window resolution.
let redrawTimeout: undefined | number = undefined;
const redraw = () => {
    window.clearTimeout(redrawTimeout);
    redrawTimeout = window.setTimeout(() => {
        for (const slide of slides) {
            // Compute new size from width;
            const styles = window.getComputedStyle(slide.canvas);
            const width = Number(styles.getPropertyValue("width").slice(0, -2));
            const size = width * window.devicePixelRatio;

            // Resize canvas;
            slide.canvas.width = size;
            slide.canvas.height = size;

            // Redraw canvas contents.
            slide.painter(slide.ctx, size);
        }
    }, 100);
};

window.addEventListener("load", redraw);
window.addEventListener("resize", redraw);
