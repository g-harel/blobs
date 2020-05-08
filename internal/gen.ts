import {rand} from "../internal/rand";
import {mapPoints} from "../internal/util";
import {BlobOptions} from "../public/blobs";
import {Point} from "./types";
import {smooth} from "./util";
import {typeCheck} from "./errors";

export const genBlob = (pointCount: number, offset: () => number): Point[] => {
    const angle = (Math.PI * 2) / pointCount;

    const points: Point[] = [];
    for (let i = 0; i < pointCount; i++) {
        const randPointOffset = offset();
        const pointX = Math.sin(i * angle);
        const pointY = Math.cos(i * angle);
        points.push({
            x: 0.5 + pointX * randPointOffset,
            y: 0.5 + pointY * randPointOffset,
            handleIn: {angle: 0, length: 0},
            handleOut: {angle: 0, length: 0},
        });
    }

    // https://math.stackexchange.com/a/873589/235756
    const smoothingStrength = ((4 / 3) * Math.tan(angle / 4)) / Math.sin(angle / 2) / 2;

    return smooth(points, smoothingStrength);
};

export const genFromOptions = (blobOptions: BlobOptions): Point[] => {
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
