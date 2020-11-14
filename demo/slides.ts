interface Slide {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}

const slides: Slide[] = [];
const slidesContainer = document.querySelector(".slides");
if (!slidesContainer) throw "missing slides container";

export const newSlide = (): Slide => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 600;
    slidesContainer.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw "missing canvas context";

    const slide = {canvas, ctx};
    slides.push(slide);
    return slide;
};
