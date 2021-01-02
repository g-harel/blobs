import {CanvasKeyframe, canvasPath} from "../public/animate";

// TODO add click me prompt before clicked.

// Fetch reference to example container.
const exampleContainer = document.querySelector(".example")!;

const canvas = document.createElement("canvas")!;
exampleContainer.appendChild(canvas);

let size = 0;
const resize = () => {
    // Set blob size relative to window, but limit to 600.
    const rawSize = Math.min(600, Math.min(window.innerWidth - 64, window.innerHeight - 256));
    canvas.style.width = `${rawSize}px`;
    canvas.style.height = `${rawSize}px`;

    // Scale resolution to take into account device pixel ratio.
    size = rawSize * (window.devicePixelRatio || 1);

    canvas.width = size;
    canvas.height = size;
};

// Set blob color and set context to erase intersection of content.
const ctx = canvas.getContext("2d")!;

// Create animation and draw its frames in `requestAnimationFrame` callbacks.
const animation = canvasPath();
const renderFrame = () => {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#ccc";
    ctx.fill(animation.renderFrame());
    requestAnimationFrame(renderFrame);
};
requestAnimationFrame(renderFrame);

// Generate a keyframe with overridable default values.
const genFrame = (overrides: Partial<CanvasKeyframe> = {}): CanvasKeyframe => ({
    duration: 4000,
    timingFunction: "ease",
    callback: loopAnimation,
    blobOptions: {
        extraPoints: 3,
        randomness: 4,
        seed: Math.random(),
        size,
    },
    ...overrides,
});

// Callback for every frame which starts transition to a new frame.
const loopAnimation = (): void => animation.transition(genFrame());

// Quickly animate to a new frame when canvas is clicked.
canvas.onclick = () => {
    animation.transition(genFrame({duration: 400, timingFunction: "elasticEnd0"}));
};

// Immediately show a new frame.
const init = () => {
    resize();
    animation.transition(genFrame({duration: 0}));
};
window.addEventListener("load", init);
window.addEventListener("resize", init);
