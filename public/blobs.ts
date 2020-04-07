import {genBlob} from "../internal/gen";
import {rand} from "../internal/rand";
import {Point} from "../internal/types";
import {mapPoints} from "../internal/util";
import {renderPath} from "../internal/render/svg";
import {renderPath2D} from "../internal/render/canvas";

export interface BlobOptions {
    seed: string | number;
    extraPoints: number;
    randomness: number;
    size: number;
}

export interface CanvasOptions {
    offsetX?: number;
    offsetY?: number;
}

export interface SvgOptions {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

const typeCheck = (name: string, val: any, expected: string[]) => {
    const actual = typeof val;
    if (!expected.includes(actual)) {
        throw `(blobs2) "${name}" should have type "${expected.join("|")}" but was "${actual}".`;
    }
};

const raw = (blobOptions: BlobOptions): Point[] => {
    const rgen = rand(String(blobOptions.seed));

    typeCheck("blobOptions", blobOptions, ["object"]);
    typeCheck("seed", blobOptions.seed, ["string", "number"]);
    typeCheck("extraPoints", blobOptions.extraPoints, ["number"]);
    typeCheck("randomness", blobOptions.randomness, ["number"]);
    typeCheck("size", blobOptions.size, ["number"]);

    // Scale of random movement increases as randomness approaches infinity.
    // randomness = 0   -> rangeStart = 1
    // randomness = 2   -> rangeStart = 0.8333
    // randomness = 5   -> rangeStart = 0.6667
    // randomness = 10  -> rangeStart = 0.5
    // randomness = 20  -> rangeStart = 0.3333
    // randomness = 50  -> rangeStart = 0.1667
    // randomness = 100 -> rangeStart = 0.0909
    const rangeStart = 1 / (1 + Math.abs(blobOptions.randomness) / 10);

    const points = genBlob(
        3 + Math.abs(blobOptions.extraPoints),
        () => (rangeStart + rgen() * (1 - rangeStart)) / 2,
    );

    const size = Math.abs(blobOptions.size);
    return mapPoints(points, ({curr}) => {
        curr.x *= size;
        curr.y *= size;
        curr.handleIn.length *= size;
        curr.handleOut.length *= size;
        return curr;
    });
};

export const canvasPath = (blobOptions: BlobOptions, canvasOptions: CanvasOptions = {}): Path2D => {
    return renderPath2D(
        mapPoints(raw(blobOptions), ({curr}) => {
            curr.x += canvasOptions.offsetX || 0;
            curr.y += canvasOptions.offsetY || 0;
            return curr;
        }),
    );
};

export const svg = (blobOptions: BlobOptions, svgOptions: SvgOptions = {}): string => {
    const path = svgPath(blobOptions);
    const size = Math.floor(blobOptions.size);
    const fill = svgOptions.fill === undefined ? "#ec576b" : svgOptions.fill;
    const stroke = svgOptions.stroke === undefined ? "none" : svgOptions.stroke;
    const strokeWidth = svgOptions.strokeWidth === undefined ? 0 : svgOptions.strokeWidth;
    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <path stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" d="${path}"/>
</svg>`.trim();
};

export const svgPath = (blobOptions: BlobOptions): string => {
    return renderPath(raw(blobOptions));
};
