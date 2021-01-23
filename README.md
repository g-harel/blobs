<p align="center">
    <a href="https://github.com/g-harel/blobs/blob/master/README.legacy.md"><b>Legacy documentation</b></a>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/blobs"><!--
     --><img src="https://img.shields.io/npm/v/blobs.svg"><!--
 --></a>
    <a href="https://github.com/g-harel/blobs/actions?query=workflow%3Aon-push"><!--
     --><img src="https://img.shields.io/github/workflow/status/g-harel/blobs/on-push"><!--
 --></a>
</p>

<p align="center">
    <a href="https://blobs.dev">
        <img src="./assets/logo.svg?sanitize=true">
    </a>
</p>

## Install

```bash
$ npm install blobs
```

```ts
import * as blobs2 from "blobs/v2";
```

```ts
import * as blobs2Animate from "blobs/v2/animate";
```

<p align="center">
    OR
</p>

```html
<script src="https://unpkg.com/blobs/v2"></script>
```

```html
<script src="https://unpkg.com/blobs/v2/animate"></script>
```

## SVG Path

```js
const svgPath = blobs2.svgPath({
    seed: Math.random(),
    extraPoints: 8,
    randomness: 4,
    size: 256,
});
doSomething(svgPath);
```

## SVG

```js
const svgString = blobs2.svg(
    {
        seed: Math.random(),
        extraPoints: 8,
        randomness: 4,
        size: 256,
    },
    {
        fill: "white", // 🚨 NOT SANITIZED
        stroke: "black", // 🚨 NOT SANITIZED
        strokeWidth: 4,
    },
);
container.innerHTML = svgString;
```

## Canvas

```js
const path = blobs2.canvasPath(
    {
        seed: Math.random(),
        extraPoints: 16,
        randomness: 2,
        size: 128,
    },
    {
        offsetX: 16,
        offsetY: 32,
    },
);
ctx.stroke(path);
```

## Canvas Animation

```js
const ctx = /* ... */;
const animation = blobs2Animate.canvasPath();

// Set up "requestAnimationFrame" rendering loop.
const renderAnimation = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fill(animation.renderFrame());
    requestAnimationFrame(renderAnimation);
};
requestAnimationFrame(renderAnimation);

// Keyframe loop.
const loopAnimation = () => {
    animation.transition({
        duration: 4000,
        timingFunction: "ease",
        callback: loopAnimation,
        blobOptions: {...},
    });
};

// Initial frame.
animation.transition({
    duration: 0, // Render immediately.
    callback: loopAnimation,
    blobOptions: {...},
});

// Toggle play/pause animation on canvas click.
ctx.canvas.onclick = () => {
    animation.playPause();
};
```

## Complete API

### `"blobs/v2"`

```ts
export interface BlobOptions {
    // A given seed will always produce the same blob.
    // Use `Math.random()` for pseudorandom behavior.
    seed: string | number;
    // Actual number of points will be `3 + extraPoints`.
    extraPoints: number;
    // Increases the amount of variation in point position.
    randomness: number;
    // Size of the bounding box.
    size: number;
}
export interface CanvasOptions {
    // Coordinates of top-left corner of the blob.
    offsetX?: number;
    offsetY?: number;
}
export interface SvgOptions {
    fill?: string; // Default: "#ec576b".
    stroke?: string; // Default: "none".
    strokeWidth?: number; // Default: 0.
}
export const canvasPath: (blobOptions: BlobOptions, canvasOptions?: CanvasOptions) => Path2D;
export const svg: (blobOptions: BlobOptions, svgOptions?: SvgOptions) => string;
export const svgPath: (blobOptions: BlobOptions) => string;
```

### `"blobs/v2/animate"`

```ts
export interface CanvasKeyframe {
    // Duration of the keyframe animation in milliseconds.
    duration: number;
    // Delay before animation begins in milliseconds.
    // Default: 0.
    delay?: number;
    // Controls the speed of the animation over time.
    // Default: "linear".
    timingFunction?:
        | "linear"
        | "easeEnd"
        | "easeStart"
        | "ease"
        | "elasticEnd0"
        | "elasticEnd1"
        | "elasticEnd2"
        | "elasticEnd3";
    // Called after keyframe end-state is reached or passed.
    // Called exactly once when the keyframe end-state is rendered.
    // Not called if the keyframe is preempted by a new transition.
    callback?: () => void;
    // Standard options, refer to "blobs/v2" documentation.
    blobOptions: {
        seed: number | string;
        randomness: number;
        extraPoints: number;
        size: number;
    };
    // Standard options, refer to "blobs/v2" documentation.
    canvasOptions?: {
        offsetX?: number;
        offsetY?: number;
    };
}
export const canvasPath: () => {
    // Renders the current state of the animation.
    renderFrame: () => Path2D;
    // Immediately begin animating through the given keyframes.
    // Non-rendered keyframes from previous transitions are cancelled.
    transition: (...keyframes: CanvasKeyframe[]) => void;
    // Resume a paused animation. Has no effect if already playing.
    play: () => void;
    // Pause a playing animation. Has no effect if already paused.
    pause: () => void;
    // Toggle between playing and pausing the animation.
    playPause: () => void;
};
```

## License

[MIT](./LICENSE)
