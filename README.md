<p align="center">
    <a href="https://github.com/g-harel/blobs/blob/master/README.legacy.md"><b>Legacy documentation</b></a>
</p>

<br>

<a href="https://blobs.dev">
    <img align="left" width="360" height="300" src="./assets/logo-color.svg?sanitize=true">
</a>

<br>
<br>

[![](https://img.shields.io/npm/v/blobs.svg)](https://www.npmjs.com/package/blobs)

```ts
// $ npm install blobs
import * as blobs2 from "blobs/v2";
```

```html
<script src="https://unpkg.com/blobs/v2"></script>
```

<br>
<br>
<br>
<br>

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
    // Size of bounding box.
    size: number;
}
export interface CanvasOptions {
    // Coordinates of top-left corner of blob.
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

<p align="center">
    <br><br>
    <img width="100" src="./assets/logo-grey.svg?sanitize=true" />
</p>
