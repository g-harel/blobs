import {CanvasKeyframe, canvasPath, wigglePreset} from "../public/animate";
import {colors} from "./internal/layout";

// Fetch reference to example container.
const exampleContainer = document.querySelector(".example")!;

const canvas = document.createElement("canvas")!;
exampleContainer.appendChild(canvas);

let size = 0;
const resize = () => {
    // Set blob size relative to window, but limit to 600.
    const rawSize = Math.min(600, Math.min(window.innerWidth - 64, window.innerHeight / 2));
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
    ctx.fillStyle = colors.highlight;
    ctx.fill(animation.renderFrame());
    requestAnimationFrame(renderFrame);
};
requestAnimationFrame(renderFrame);

// Extra points that increases when blob gets clicked.
let extraPoints = 0;

const genWiggle = (transition: number) => {
    wigglePreset(
        animation,
        {
            extraPoints: 3 + extraPoints,
            randomness: 1.5,
            seed: Math.random(),
            size,
        },
        {},
        {speed: 1, initialTransition: transition, initialTimingFunction: "ease"},
    );
};

// Generate a keyframe with overridable default values.
const genFrame = (overrides: any = {}): CanvasKeyframe => {
    const blobOptions = {
        extraPoints: 3 + extraPoints,
        randomness: 4,
        seed: Math.random(),
        size,
        ...overrides.blobOptions,
    };
    return {
        duration: 4000,
        timingFunction: "ease",
        callback: loopAnimation,
        ...overrides,
        blobOptions,
    };
};

// Callback for every frame which starts transition to a new frame.
const loopAnimation = (): void => {
    extraPoints = 0;
    genWiggle(4000);
};

// Quickly animate to a new frame when canvas is clicked.
canvas.onclick = () => {
    extraPoints++;
    animation.transition(
        genFrame({duration: 400, timingFunction: "elasticEnd0", blobOptions: {extraPoints}}),
    );
};

// Immediately show a new frame.
window.addEventListener("load", () => {
    resize();
    genWiggle(0);
});

// Make blob a circle while window is being resized.
window.addEventListener("resize", () => {
    resize();
    const tempSize = (size * 6) / 7;
    animation.transition(
        genFrame({
            duration: 100,
            timingFunction: "easeEnd",
            blobOptions: {
                extraPoints: 0,
                randomness: 0,
                seed: "",
                size: tempSize,
            },
            canvasOptions: {
                offsetX: (size - tempSize) / 2,
                offsetY: (size - tempSize) / 2,
            },
        }),
    );
});
