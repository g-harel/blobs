import {genFromOptions} from "../internal/gen";
import {renderPath} from "../internal/render/svg";
import {renderPath2D} from "../internal/render/canvas";
import {mapPoints} from "../internal/util";
import {checkBlobOptions} from "../internal/check";

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

export const canvasPath = (blobOptions: BlobOptions, canvasOptions: CanvasOptions = {}): Path2D => {
    // TODO check options
    return renderPath2D(
        mapPoints(genFromOptions(blobOptions), ({curr}) => {
            curr.x += canvasOptions.offsetX || 0;
            curr.y += canvasOptions.offsetY || 0;
            return curr;
        }),
    );
};

export const svg = (blobOptions: BlobOptions, svgOptions: SvgOptions = {}): string => {
    // TODO check options
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
    try {
        checkBlobOptions(blobOptions);
    } catch (e) {
        throw `(blobs2): ${e}`;
    }
    return renderPath(genFromOptions(blobOptions));
};
