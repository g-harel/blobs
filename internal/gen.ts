import {rand} from "../internal/rand";
import {mapPoints} from "../internal/util";
import {BlobOptions} from "../public/blobs";
import {Point} from "./types";
import {smooth} from "./util";

export const smoothBlob = (blobygon: Point[]): Point[] => {
    // https://math.stackexchange.com/a/873589/235756
    const angle = (Math.PI * 2) / blobygon.length;
    const smoothingStrength = ((4 / 3) * Math.tan(angle / 4)) / Math.sin(angle / 2) / 2;
    return smooth(blobygon, smoothingStrength);
};

export const genBlobygon = (pointCount: number, offset: (id: number) => number): Point[] => {
    const angle = (Math.PI * 2) / pointCount;
    const points: Point[] = [];
    for (let i = 0; i < pointCount; i++) {
        const randPointOffset = offset(i);
        const pointX = Math.sin(i * angle);
        const pointY = Math.cos(i * angle);
        points.push({
            x: 0.5 + pointX * randPointOffset,
            y: 0.5 + pointY * randPointOffset,
            handleIn: {angle: 0, length: 0},
            handleOut: {angle: 0, length: 0},
        });
    }
    return points;
};

export const genBlob = (pointCount: number, offset: (id: number) => number): Point[] => {
    return smoothBlob(genBlobygon(pointCount, offset));
};

export const genFromOptions = (blobOptions: BlobOptions): Point[] => {
    const rgen = rand(String(blobOptions.seed));

    // Scale of random movement increases as randomness approaches infinity.
    // randomness = 0   -> rangeStart = 1
    // randomness = 2   -> rangeStart = 0.8333
    // randomness = 5   -> rangeStart = 0.6667
    // randomness = 10  -> rangeStart = 0.5
    // randomness = 20  -> rangeStart = 0.3333
    // randomness = 50  -> rangeStart = 0.1667
    // randomness = 100 -> rangeStart = 0.0909
    const rangeStart = 1 / (1 + blobOptions.randomness / 10);

    const points = genBlob(
        3 + blobOptions.extraPoints,
        () => (rangeStart + rgen() * (1 - rangeStart)) / 2,
    );

    const size = blobOptions.size;
    return mapPoints(points, ({curr}) => {
        curr.x *= size;
        curr.y *= size;
        curr.handleIn.length *= size;
        curr.handleOut.length *= size;
        return curr;
    });
};
