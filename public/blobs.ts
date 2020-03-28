import {genBlob} from "../internal/gen";
import {rand} from "../internal/rand";
import {Point} from "../internal/types";
import {mapPoints} from "../internal/util";
import {renderPath, renderEditable} from "../internal/render/svg";

// TODO include editable types in this file
// TODO make path editable in editable svg
// TODO make editable svg more structured

export interface BlobOptions {
    seed: string | number;
    extraPoints: number;
    randomness: number;
    size: number;
}

export interface CanvasOptions {}

export interface SvgOptions {
    style: {
        color: string;
        strokeColor: string;
    }
}

export const raw = (blobOptions: BlobOptions): Point[] => {
    const rgen = rand(String(blobOptions.seed));

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
        () => rangeStart + rgen() * (1 - rangeStart),
    );

    return mapPoints(points, ({curr}) => {
        curr.x *= blobOptions.size;
        curr.y *= blobOptions.size;
        curr.handleIn.length *= blobOptions.size;
        curr.handleOut.length *= blobOptions.size;
        return curr;
    });
};

export const canvas = (blobOptions: BlobOptions, canvasOptions: CanvasOptions) => {
    // TODO
};

export const svg = (blobOptions: BlobOptions, svgOptions: SvgOptions) => {};

export const svgPath = (blobOptions: BlobOptions): string => {
    return renderPath(raw(blobOptions));
};

export const svgEditable = (blobOptions: BlobOptions, svgOptions: SvgOptions) => {
    // TODO fill from svgOptions
    // return renderEditable(raw(blobOptions), {
    //     closed: true,
    //     height: blobOptions.size,
    //     width: blobOptions.size,
    //     boundingBox: false,
    //     fill: "",
    //     guides: false,
    //     stroke: "",
    //     strokeWidth: 0,
    //     transform: "",
    // });
};
