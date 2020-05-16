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

<p align="center">
    OR
</p>

```html
<script src="https://unpkg.com/blobs/v2"></script>
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

## Complete API

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

## License

[MIT](./LICENSE)
